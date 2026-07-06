import { NextResponse } from "next/server";

import { ApiError, requireAdmin } from "@/lib/api-helpers";
import { inlinePdfResponse, isPdfBuffer } from "@/lib/inline-pdf-response";
import { prisma } from "@/lib/prisma";
import {
  readNewsPdf,
  resolveNewsPdfAbsolutePath,
} from "@/lib/storage/news-pdf";

/** Plain-text errors so the browser does not treat 404 bodies as PDF (tab crash). */
export function adminNewsPdfPlainError(
  message: string,
  status: number
): NextResponse {
  return new NextResponse(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function isAdminNewsPdfReadable(
  postId: string,
  pdfPath: string | null | undefined
): Promise<boolean> {
  if (!pdfPath?.trim()) return false;
  if (!resolveNewsPdfAbsolutePath(pdfPath, postId)) return false;
  try {
    const buffer = await readNewsPdf(pdfPath, postId);
    return isPdfBuffer(buffer);
  } catch {
    return false;
  }
}

export async function buildAdminNewsPdfResponse(
  postId: string
): Promise<NextResponse> {
  await requireAdmin();

  const post = await prisma.newsPost.findUnique({ where: { id: postId } });
  if (!post?.pdfPath) {
    throw new ApiError("PDF not found", 404);
  }

  const buffer = await readNewsPdf(post.pdfPath, post.id);

  if (!isPdfBuffer(buffer)) {
    throw new ApiError("PDF file is invalid or corrupt", 404);
  }

  return inlinePdfResponse(buffer, {
    cacheControl: "private, no-store, no-cache",
  });
}
