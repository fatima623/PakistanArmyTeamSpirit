import path from "path";

export const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;

export const MAX_FLIGHT_DOC_BYTES = 10 * 1024 * 1024;

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

/** Flight documents (passport / ticket PDFs) storage root. */
export function getFlightDocStorageRoot(): string {
  const configured = process.env.FLIGHT_DOC_STORAGE_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "uploads", "flight-docs");
}
