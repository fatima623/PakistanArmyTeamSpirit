/**
 * Keep in sync with src/lib/storage/payment-proof-naming.ts
 * payment-proof_user-{userId}_{sanitized-name}_{DD_MM_YYYY}_{uniqueHash}.{extension}
 */

export function sanitizeProofSlug(value) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "proof"
  );
}

export function formatProofDateStamp(date = new Date()) {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  return `${dd}_${mm}_${yyyy}`;
}

export function buildPaymentProofFileName({
  userId,
  uploaderName,
  extension,
  uploadedAt = new Date(),
  uniqueHash,
}) {
  const ext = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  const nameSlug = sanitizeProofSlug(uploaderName);
  const dateStamp = formatProofDateStamp(uploadedAt);
  const hash =
    uniqueHash ??
    Math.random().toString(16).slice(2, 8).padEnd(6, "0").slice(0, 6);

  return `payment-proof_user-${safeUserId}_${nameSlug}_${dateStamp}_${hash}.${ext}`;
}
