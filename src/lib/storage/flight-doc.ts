import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";

import {
  getFlightDocStorageRoot,
  MAX_FLIGHT_DOC_BYTES,
} from "@/lib/storage/config";
import { ensureUploadDirs } from "@/lib/storage/ensure-upload-dirs";

export type FlightDocKind = "passport" | "ticket";

export type FlightDocUploadResult = {
  internalFilePath: string;
  fileSize: number;
  originalFileName: string;
  uploadedAt: Date;
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

/** Persist a validated flight document PDF; returns the relative DB path. */
export async function saveFlightDoc(input: {
  userId: string;
  kind: FlightDocKind;
  originalFileName: string;
  buffer: Buffer;
  declaredMime: string;
}): Promise<FlightDocUploadResult> {
  ensureUploadDirs();
  validateFlightDocPdf(input.buffer, input.originalFileName, input.declaredMime);

  const uploadedAt = new Date();
  const internalFilePath = buildInternalFlightDocPath(
    input.userId,
    input.kind,
    uploadedAt
  );
  const absolute = resolveAbsoluteFlightDocPath(internalFilePath);

  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, input.buffer, { flag: "wx" });

  return {
    internalFilePath,
    fileSize: input.buffer.length,
    originalFileName: input.originalFileName.slice(0, 255),
    uploadedAt,
  };
}

export async function readFlightDocByInternalPath(
  internalFilePath: string,
  downloadName?: string | null
): Promise<FlightDocFilePayload> {
  const absolute = resolveAbsoluteFlightDocPath(internalFilePath);
  const buffer = await readFile(absolute);
  return {
    buffer,
    mimeType: "application/pdf",
    fileName: downloadName || path.basename(absolute),
  };
}

/** Best-effort removal of a replaced/deleted document. */
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
