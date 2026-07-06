import path from "path";

export const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;

/** Relative to project root unless absolute path is set in env. */
export function getPaymentProofStorageRoot(): string {
  const configured = process.env.PAYMENT_PROOF_STORAGE_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "uploads", "payment-proofs");
}
