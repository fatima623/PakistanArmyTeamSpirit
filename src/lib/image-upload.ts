/**
 * Browser-side image shrinking for admin uploads.
 *
 * Vercel caps a serverless request body at 4.5 MB and answers anything larger
 * with a 413 at the edge — the route handler never runs, so its own (larger)
 * size limit never gets a say. Re-encoding the picture here keeps the upload
 * under that ceiling, and the smaller binary is also what lands in the
 * `LONGBLOB` column, so the database stays lean too.
 */

/** Vercel's hard request-body ceiling. */
const PLATFORM_BODY_LIMIT = 4.5 * 1024 * 1024;

/** Headroom for the multipart envelope and the other form fields. */
export const MAX_UPLOAD_BYTES = Math.floor(PLATFORM_BODY_LIMIT * 0.82); // ~3.8 MB

/** Longest edge kept for hero art — beyond this the extra pixels never show. */
const DEFAULT_MAX_EDGE = 2560;

const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55, 0.45];

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality)
  );
}

function withJpegName(name: string): string {
  const stem = name.replace(/\.[^.]+$/, "") || "image";
  return `${stem}.jpg`;
}

/**
 * Returns a file guaranteed to be small enough to POST, or the original when it
 * already is. Never throws: if the browser cannot decode or re-encode the
 * picture the original is returned and the server reports the problem.
 */
export async function prepareImageForUpload(
  file: File,
  options: { maxBytes?: number; maxEdge?: number } = {}
): Promise<File> {
  const maxBytes = options.maxBytes ?? MAX_UPLOAD_BYTES;
  const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;

  if (file.size <= maxBytes) return file;
  if (typeof document === "undefined") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return file;

    // Each pass halves the target edge; quality alone cannot rescue a 24 MP
    // photograph, and two passes take any realistic camera output under 4 MB.
    for (let edge = maxEdge; edge >= 640; edge = Math.round(edge / 2)) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.clearRect(0, 0, canvas.width, canvas.height);
      // JPEG has no alpha — paint white so transparent PNGs do not go black.
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITY_STEPS) {
        const blob = await canvasToBlob(canvas, quality);
        if (blob && blob.size <= maxBytes) {
          return new File([blob], withJpegName(file.name), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
        }
      }
    }
    return file;
  } finally {
    bitmap.close();
  }
}
