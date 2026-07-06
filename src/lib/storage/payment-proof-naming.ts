import { createHash, randomBytes } from "crypto";

/**
 * Payment proof filename convention (basename only):
 * payment-proof_user-{userId}_{sanitized-name}_{DD_MM_YYYY}_{uniqueHash}.{extension}
 *
 * Example: payment-proof_user-42_john-perry_19_05_2026_a82fd1.png
 */

export function sanitizeProofSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "proof"
  );
}

/** UTC date stamp for filenames: DD_MM_YYYY */
export function formatProofDateStamp(date = new Date()): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  return `${dd}_${mm}_${yyyy}`;
}

function sanitizeUserIdSegment(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
}

function sanitizeExtension(extension: string): string {
  return extension.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function generateProofUniqueHash(): string {
  return createHash("sha256")
    .update(randomBytes(16))
    .digest("hex")
    .slice(0, 6);
}

export function buildPaymentProofFileName(params: {
  userId: string;
  uploaderName: string;
  extension: string;
  uploadedAt?: Date;
  uniqueHash?: string;
}): string {
  const ext = sanitizeExtension(params.extension);
  const safeUserId = sanitizeUserIdSegment(params.userId);
  const nameSlug = sanitizeProofSlug(params.uploaderName);
  const dateStamp = formatProofDateStamp(params.uploadedAt ?? new Date());
  const hash = params.uniqueHash ?? generateProofUniqueHash();

  return `payment-proof_user-${safeUserId}_${nameSlug}_${dateStamp}_${hash}.${ext}`;
}
