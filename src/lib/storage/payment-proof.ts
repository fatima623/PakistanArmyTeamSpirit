import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import {
  getPaymentProofStorageRoot,
  MAX_PAYMENT_PROOF_BYTES,
} from "@/lib/storage/config";
import { ensureUploadDirs } from "@/lib/storage/ensure-upload-dirs";
import { buildPaymentProofFileName } from "@/lib/storage/payment-proof-naming";

export { sanitizeProofSlug } from "@/lib/storage/payment-proof-naming";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

const LEGACY_PUBLIC_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "payments"
);

export type PaymentProofUploadInput = {
  userId: string;
  uploaderName: string;
  uploaderEmail: string;
  originalFileName: string;
  buffer: Buffer;
  declaredMime: string;
};

export type PaymentProofUploadResult = {
  internalFilePath: string;
  mimeType: string;
  fileSize: number;
  originalFileName: string;
  uploadedAt: Date;
};

export type PaymentProofFilePayload = {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
};

export function isAllowedProofMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime);
}

export function isAllowedProofExtension(ext: string): boolean {
  return ext in EXT_TO_MIME;
}

function extensionFromFileName(fileName: string): string | null {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

function detectMimeFromMagic(buffer: Buffer): string | null {
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50) {
    return "application/pdf";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  return null;
}

export function validatePaymentProofFile(
  buffer: Buffer,
  originalFileName: string,
  declaredMime: string
): { mimeType: string; extension: string } {
  if (buffer.length === 0) {
    throw new Error("Empty file");
  }
  if (buffer.length > MAX_PAYMENT_PROOF_BYTES) {
    throw new Error("File must be under 5MB");
  }

  const ext = extensionFromFileName(originalFileName);
  if (!ext || !isAllowedProofExtension(ext)) {
    throw new Error("Allowed file types: PNG, JPG, JPEG, PDF");
  }

  const extMime = EXT_TO_MIME[ext];
  if (!isAllowedProofMime(declaredMime) || declaredMime !== extMime) {
    throw new Error("File type does not match extension");
  }

  const magicMime = detectMimeFromMagic(buffer);
  if (!magicMime || magicMime !== extMime) {
    throw new Error("File content does not match declared type");
  }

  return { mimeType: extMime, extension: ext };
}

export function buildInternalProofFileName(
  userId: string,
  uploaderName: string,
  extension: string,
  uploadedAt?: Date
): string {
  return buildPaymentProofFileName({
    userId,
    uploaderName,
    extension,
    uploadedAt,
  });
}

/** Relative path stored in DB (posix-style). */
export function buildInternalFilePath(
  userId: string,
  fileName: string
): string {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeFile = path.basename(fileName).replace(/[/\\]/g, "");
  return `${safeUserId}/${yyyy}/${mm}/${safeFile}`.replace(/\\/g, "/");
}

export function resolveAbsoluteProofPath(internalFilePath: string): string {
  if (!internalFilePath || internalFilePath.includes("..")) {
    throw new Error("Invalid storage path");
  }
  const root = path.resolve(getPaymentProofStorageRoot());
  const absolute = path.resolve(root, internalFilePath);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    throw new Error("Path traversal blocked");
  }
  return absolute;
}

export async function savePaymentProofInternal(
  input: PaymentProofUploadInput
): Promise<PaymentProofUploadResult> {
  ensureUploadDirs();

  const { mimeType, extension } = validatePaymentProofFile(
    input.buffer,
    input.originalFileName,
    input.declaredMime
  );

  const uploadedAt = new Date();
  const fileName = buildInternalProofFileName(
    input.userId,
    input.uploaderName,
    extension,
    uploadedAt
  );
  const internalFilePath = buildInternalFilePath(input.userId, fileName);
  const absolute = resolveAbsoluteProofPath(internalFilePath);

  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, input.buffer, { flag: "wx" });

  return {
    internalFilePath,
    mimeType,
    fileSize: input.buffer.length,
    originalFileName: input.originalFileName.slice(0, 255),
    uploadedAt,
  };
}

export async function readPaymentProofByInternalPath(
  internalFilePath: string
): Promise<PaymentProofFilePayload> {
  const absolute = resolveAbsoluteProofPath(internalFilePath);
  const buffer = await readFile(absolute);
  const ext = extensionFromFileName(absolute);
  const mimeType = ext ? EXT_TO_MIME[ext] : "application/octet-stream";
  return {
    buffer,
    mimeType,
    fileName: path.basename(absolute),
  };
}

export async function readLegacyPublicProof(
  proofFileName: string
): Promise<PaymentProofFilePayload> {
  const safeName = path.basename(proofFileName);
  if (safeName !== proofFileName || safeName.includes("..")) {
    throw new Error("Invalid legacy file name");
  }
  const absolute = path.join(LEGACY_PUBLIC_DIR, safeName);
  const buffer = await readFile(absolute);
  const ext = extensionFromFileName(safeName);
  const mimeType = ext ? EXT_TO_MIME[ext] : "application/octet-stream";
  return { buffer, mimeType, fileName: safeName };
}

export function hasInternalProof(payment: {
  internalFilePath?: string | null;
}): boolean {
  return Boolean(payment.internalFilePath?.trim());
}

export function hasLegacyPublicProof(payment: {
  proofFileName?: string | null;
  internalFilePath?: string | null;
}): boolean {
  return Boolean(payment.proofFileName?.trim() && !payment.internalFilePath);
}

export function hasAnyPaymentProof(payment: {
  internalFilePath?: string | null;
  proofFileName?: string | null;
}): boolean {
  return hasInternalProof(payment) || hasLegacyPublicProof(payment);
}
