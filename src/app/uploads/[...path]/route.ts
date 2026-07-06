import { readFile } from "fs/promises";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
  webp: "image/webp",
  gif: "image/gif",
};

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, context: RouteContext) {
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

  try {
    const buffer = await readFile(absolute);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentTypeFor(absolute),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
