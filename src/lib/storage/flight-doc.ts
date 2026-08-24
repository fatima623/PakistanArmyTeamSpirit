import { readFile, unlink } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";

import {
  getFlightDocStorageRoot,
  MAX_FLIGHT_DOC_BYTES,
} from "@/lib/storage/config";

/** `ticket` is the outbound ("coming") leg; `returnTicket` the way back. */
export type FlightDocKind = "passport" | "ticket" | "returnTicket";

export type FlightDocUploadResult = {
  internalFilePath: string;
  fileSize: number;
  originalFileName: string;
  uploadedAt: Date;
  /** PDF bytes, written to the record's `*Data` column. */
  data: Uint8Array<ArrayBuffer>;
};

export type FlightDocFilePayload = {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
};

/** Strict PDF validation: extension, declared MIME, and %PDF magic bytes. */
export function validateFlightDocPdf(
  buffer: Buffer,
  originalFileName: string,
  declaredMime: string
): void {
  if (buffer.length === 0) {
    throw new Error("Empty file");
  }
  if (buffer.length > MAX_FLIGHT_DOC_BYTES) {
    throw new Error("File must be under 10MB");
  }
  if (!/\.pdf$/i.test(originalFileName)) {
    throw new Error("Only PDF files are allowed");
  }
  if (declaredMime !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }
  const isPdfMagic =
    buffer.length >= 5 &&
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2d; // -
  if (!isPdfMagic) {
    throw new Error("File content is not a valid PDF");
  }
}

export function resolveAbsoluteFlightDocPath(internalFilePath: string): string {
  if (!internalFilePath || internalFilePath.includes("..")) {
    throw new Error("Invalid storage path");
  }
  const root = path.resolve(getFlightDocStorageRoot());
  const absolute = path.resolve(root, internalFilePath);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    throw new Error("Path traversal blocked");
  }
  return absolute;
}

function buildInternalFlightDocPath(
  userId: string,
  kind: FlightDocKind,
  uploadedAt: Date
): string {
  const yyyy = String(uploadedAt.getUTCFullYear());
  const mm = String(uploadedAt.getUTCMonth() + 1).padStart(2, "0");
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const stamp = uploadedAt
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);
  const rand = randomBytes(4).toString("hex");
  return `${safeUserId}/${yyyy}/${mm}/${kind}-${stamp}-${rand}.pdf`;
}

/**
 * Validate a flight document PDF and return the row to write.
 *
 * The bytes go into the record's `*Data` column, NOT onto disk: serverless
 * hosts mount the bundle read-only, so `mkdir`/`writeFile` throw ENOENT there
 * and every upload failed in production. This mirrors how the site's other
 * media (gallery, hero, news, event) is already stored.
 *
 * `internalFilePath` is still generated and stored — it remains the logical
 * key, the presence flag that `isFlightRecordComplete` and every coverage
 * query test, and the lookup path for documents uploaded before this change.
 */
export async function saveFlightDoc(input: {
  userId: string;
  kind: FlightDocKind;
  originalFileName: string;
  buffer: Buffer;
  declaredMime: string;
}): Promise<FlightDocUploadResult> {
  validateFlightDocPdf(input.buffer, input.originalFileName, input.declaredMime);

  const uploadedAt = new Date();

  return {
    internalFilePath: buildInternalFlightDocPath(
      input.userId,
      input.kind,
      uploadedAt
    ),
    fileSize: input.buffer.length,
    originalFileName: input.originalFileName.slice(0, 255),
    uploadedAt,
    data: new Uint8Array(input.buffer),
  };
}

/**
 * Resolve a stored document to a servable payload.
 *
 * `data` is the DB column and wins. Documents uploaded before the move to
 * database storage have a path but no bytes, so those fall back to reading the
 * file — which still works on a self-hosted install and simply 404s on a
 * serverless host, where the file never existed in the first place.
 */
export async function readFlightDoc(input: {
  data: Uint8Array | Buffer | null;
  internalFilePath: string;
  downloadName?: string | null;
}): Promise<FlightDocFilePayload> {
  const fileName =
    input.downloadName || path.basename(input.internalFilePath) || "document.pdf";

  if (input.data && input.data.length > 0) {
    return {
      buffer: Buffer.from(input.data),
      mimeType: "application/pdf",
      fileName,
    };
  }

  const absolute = resolveAbsoluteFlightDocPath(input.internalFilePath);
  const buffer = await readFile(absolute);
  return { buffer, mimeType: "application/pdf", fileName };
}

/**
 * Best-effort removal of a replaced/deleted document's LEGACY disk copy.
 *
 * Documents written since the move to database storage have no file to remove
 * — clearing the row (or the column) is what deletes them. This stays for the
 * older on-disk ones, and never throws: on a read-only filesystem there is
 * nothing to unlink and nothing to report.
 */
export async function deleteFlightDocByInternalPath(
  internalFilePath: string | null | undefined
): Promise<void> {
  if (!internalFilePath) return;
  try {
    const absolute = resolveAbsoluteFlightDocPath(internalFilePath);
    await unlink(absolute);
  } catch {
    // ignore missing files — DB stays the source of truth
  }
}
