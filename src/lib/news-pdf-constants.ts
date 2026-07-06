/** Client-safe news PDF limits (server storage enforces the same value). */
export const MAX_NEWS_PDF_BYTES = 10 * 1024 * 1024;

/** Reject tiny/corrupt placeholders — real PDFs are always larger. */
export const MIN_NEWS_PDF_BYTES = 1000;

export const INVALID_NEWS_PDF_MESSAGE =
  "Invalid PDF file. Please upload a valid PDF.";
