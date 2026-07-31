import { createReadStream } from "fs";
import { readFile, stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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

/**
 * Media kinds whose binaries now live in the DB (see storage/*-image.ts). The
 * filename tail of the public URL is `<id>.<ext>` (plus `-poster` for gallery
 * video posters), so the id can be recovered and the blob looked up.
 */
const DB_MEDIA_KINDS = new Set(["gallery", "events", "hero", "news"]);

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

type DbMedia = { data: Uint8Array<ArrayBuffer>; mime: string };

/** Recovers the record id from `<id>.<ext>` / `<id>-poster.<ext>`. */
function idFromFileName(fileName: string): { id: string; isPoster: boolean } {
  const dot = fileName.lastIndexOf(".");
  const base = dot === -1 ? fileName : fileName.slice(0, dot);
  const isPoster = base.endsWith("-poster");
  const id = isPoster ? base.slice(0, -"-poster".length) : base;
  return { id, isPoster };
}

/** Looks up a media binary stored in the DB; null if the row/blob is absent. */
async function loadDbMedia(
  kind: string,
  fileName: string
): Promise<DbMedia | null> {
  const { id, isPoster } = idFromFileName(fileName);
  if (!id) return null;

  switch (kind) {
    case "gallery": {
      // Separate static selects (not a dynamic select) so Prisma infers the
      // row shape, and so a poster request never pulls the full media blob.
      if (isPoster) {
        const row = await prisma.galleryImage.findUnique({
          where: { id },
          select: { posterData: true, posterMimeType: true },
        });
        return row?.posterData
          ? {
              data: new Uint8Array(row.posterData),
              mime: row.posterMimeType ?? "",
            }
          : null;
      }
      const row = await prisma.galleryImage.findUnique({
        where: { id },
        select: { imageData: true, imageMimeType: true },
      });
      return row?.imageData
        ? { data: new Uint8Array(row.imageData), mime: row.imageMimeType ?? "" }
        : null;
    }
    case "events": {
      const row = await prisma.event.findUnique({
        where: { id },
        select: { thumbnailData: true, thumbnailMimeType: true },
      });
      return row?.thumbnailData
        ? {
            data: new Uint8Array(row.thumbnailData),
            mime: row.thumbnailMimeType ?? "",
          }
        : null;
    }
    case "hero": {
      const row = await prisma.heroSlide.findUnique({
        where: { id },
        select: { imageData: true, imageMimeType: true },
      });
      return row?.imageData
        ? { data: new Uint8Array(row.imageData), mime: row.imageMimeType ?? "" }
        : null;
    }
    case "news": {
      const row = await prisma.newsPost.findUnique({
        where: { id },
        select: { imageData: true, imageMimeType: true },
      });
      return row?.imageData
        ? { data: new Uint8Array(row.imageData), mime: row.imageMimeType ?? "" }
        : null;
    }
    default:
      return null;
  }
}

/** Serves an in-memory buffer, honouring Range requests for video seeking. */
function serveBuffer(
  request: NextRequest,
  buffer: Uint8Array<ArrayBuffer>,
  contentType: string,
  ext: string
): NextResponse {
  const baseHeaders = {
    "Content-Type": contentType,
    "Cache-Control": "private, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  };

  if (STREAMABLE_EXTS.has(ext)) {
    const size = buffer.length;
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
    const slice = buffer.subarray(start, end + 1);

    return new NextResponse(slice, {
      status: range ? 206 : 200,
      headers: {
        ...baseHeaders,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
      },
    });
  }

  return new NextResponse(buffer, { headers: baseHeaders });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path: segments } = await context.params;
  const relativePath = segments.join("/");

  if (!relativePath || relativePath.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fileName = segments[segments.length - 1];
  const ext = extensionOf(fileName);
  const contentType = contentTypeFor(fileName);

  // DB-first: media uploaded on any host (incl. Vercel's read-only FS) lives in
  // the database. The URL shape is `/<kind>/<id>.<ext>` for the four known kinds.
  if (segments.length === 2 && DB_MEDIA_KINDS.has(segments[0])) {
    try {
      const media = await loadDbMedia(segments[0], fileName);
      if (media) {
        return serveBuffer(request, media.data, media.mime || contentType, ext);
      }
    } catch {
      // Fall through to the disk fallback below on any lookup error.
    }
  }

  // Legacy disk fallback — files written before the DB migration (e.g. items
  // uploaded locally and not yet backfilled) still resolve from <cwd>/uploads.
  const absolute = path.resolve(UPLOADS_ROOT, relativePath);
  const uploadsRootResolved = path.resolve(UPLOADS_ROOT);

  if (
    absolute !== uploadsRootResolved &&
    !absolute.startsWith(uploadsRootResolved + path.sep)
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const baseHeaders = {
    "Content-Type": contentType,
    "Cache-Control": "private, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  };

  // Video is streamed from disk so a <video> element can seek without pulling
  // the whole file; everything else keeps the simpler read-into-memory path.
  if (STREAMABLE_EXTS.has(ext)) {
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
