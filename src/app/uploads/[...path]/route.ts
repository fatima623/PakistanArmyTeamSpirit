import { createReadStream } from "fs";
import { readFile, stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import { NextRequest, NextResponse } from "next/server";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

/** Extensions served as byte-range streams so the browser can seek. */
const STREAMABLE_EXTS = new Set(["mp4", "webm", "mov"]);

function extensionOf(filePath: string): string {
  return path.extname(filePath).slice(1).toLowerCase();
}

function contentTypeFor(filePath: string): string {
  return EXT_TO_MIME[extensionOf(filePath)] ?? "application/octet-stream";
}

/** Parses a single `bytes=start-end` range against a known file size. */
function parseRange(
  header: string,
  size: number
): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  if (rawStart === "" && rawEnd === "") return null;

  let start: number;
  let end: number;

  if (rawStart === "") {
    // Suffix form: `bytes=-500` means the final 500 bytes.
    const suffixLength = Number(rawEnd);
    if (suffixLength <= 0) return null;
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? size - 1 : Number(rawEnd);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start > end || start >= size) return null;

  return { start, end: Math.min(end, size - 1) };
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path: segments } = await context.params;
  const relativePath = segments.join("/");

  if (!relativePath || relativePath.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const absolute = path.resolve(UPLOADS_ROOT, relativePath);
  const uploadsRootResolved = path.resolve(UPLOADS_ROOT);

  if (
    absolute !== uploadsRootResolved &&
    !absolute.startsWith(uploadsRootResolved + path.sep)
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = contentTypeFor(absolute);
  const baseHeaders = {
    "Content-Type": contentType,
    "Cache-Control": "private, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  };

  // Video is streamed so a <video> element can seek without pulling the whole
  // file; everything else keeps the simpler read-into-memory path.
  if (STREAMABLE_EXTS.has(extensionOf(absolute))) {
    let size: number;
    try {
      const stats = await stat(absolute);
      if (!stats.isFile()) return new NextResponse("Not found", { status: 404 });
      size = stats.size;
    } catch {
      return new NextResponse("Not found", { status: 404 });
    }

    const rangeHeader = request.headers.get("range");
    const range = rangeHeader ? parseRange(rangeHeader, size) : null;

    if (rangeHeader && !range) {
      return new NextResponse("Range not satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    const start = range?.start ?? 0;
    const end = range?.end ?? size - 1;
    const stream = Readable.toWeb(
      createReadStream(absolute, { start, end })
    ) as ReadableStream<Uint8Array>;

    return new NextResponse(stream, {
      status: range ? 206 : 200,
      headers: {
        ...baseHeaders,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
      },
    });
  }

  try {
    const buffer = await readFile(absolute);
    return new NextResponse(buffer, { headers: baseHeaders });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
