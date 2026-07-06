import { NextResponse } from "next/server";

export const PDF_CONTENT_TYPE = "application/pdf";

/** ASCII-safe filename for Content-Disposition (RFC 6266). */
export function safePdfFilename(name: string | null | undefined): string {
  const trimmed = (name ?? "document.pdf").trim() || "document.pdf";
  const ascii = trimmed.replace(/[^\w.\- ()]/g, "_").slice(0, 200);
  return ascii.toLowerCase().endsWith(".pdf") ? ascii : `${ascii || "document"}.pdf`;
}

export function isPdfBuffer(buffer: Buffer | Uint8Array): boolean {
  return (
    buffer.byteLength >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  );
}

type InlinePdfHeaderOptions = {
  cacheControl: string;
};

/** Headers for native in-tab PDF viewing (no HTML shell, no attachment). */
export function inlinePdfResponseHeaders(
  buffer: Buffer | Uint8Array,
  options: InlinePdfHeaderOptions
): Record<string, string> {
  return {
    "Content-Type": PDF_CONTENT_TYPE,
    "Content-Length": String(buffer.byteLength),
    "Content-Disposition": "inline",
    "Accept-Ranges": "bytes",
    "Cache-Control": options.cacheControl,
    "X-Content-Type-Options": "nosniff",
  };
}

export function inlinePdfResponse(
  buffer: Buffer,
  options: InlinePdfHeaderOptions
): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: inlinePdfResponseHeaders(buffer, options),
  });
}
