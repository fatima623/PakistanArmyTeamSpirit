import { NextResponse } from "next/server";

import {
  ApiError,
  handleApiError,
  requireAdmin,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { revalidateNewsPaths } from "@/lib/revalidate-public";
import { INVALID_NEWS_PDF_MESSAGE } from "@/lib/news-pdf-constants";
import {
  deleteNewsPdfFile,
  MAX_NEWS_PDF_BYTES,
  saveNewsPdf,
  validateNewsPdfBuffer,
} from "@/lib/storage/news-pdf";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const post = await prisma.newsPost.findUnique({ where: { id } });
    if (!post) {
      throw new ApiError("News post not found", 404);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError("PDF file is required", 400);
    }

    if (file.size > MAX_NEWS_PDF_BYTES) {
      throw new ApiError("PDF must be 10 MB or smaller", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    validateNewsPdfBuffer(buffer, file.type || "application/pdf");

    const saved = await saveNewsPdf({
      postId: id,
      buffer,
      originalFileName: file.name || "document.pdf",
      declaredMime: file.type || "application/pdf",
    });

    if (post.pdfPath && post.pdfPath !== saved.pdfPath) {
      await deleteNewsPdfFile(post.pdfPath, id);
    }

    const updated = await prisma.newsPost.update({
      where: { id },
      data: {
        pdfPath: saved.pdfPath,
        pdfOriginalName: saved.pdfOriginalName,
        pdfMimeType: saved.pdfMimeType,
        pdfFileSize: saved.pdfFileSize,
      },
    });

    revalidateNewsPaths();

    return NextResponse.json({ post: updated });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_PDF") {
        return handleApiError(new ApiError(INVALID_NEWS_PDF_MESSAGE, 400));
      }
      if (error.message === "FILE_TOO_LARGE") {
        return handleApiError(
          new ApiError("PDF must be 10 MB or smaller", 400)
        );
      }
    }
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const post = await prisma.newsPost.findUnique({ where: { id } });
    if (!post) {
      throw new ApiError("News post not found", 404);
    }

    await deleteNewsPdfFile(post.pdfPath, id);

    const updated = await prisma.newsPost.update({
      where: { id },
      data: {
        pdfPath: null,
        pdfOriginalName: null,
        pdfMimeType: null,
        pdfFileSize: null,
      },
    });

    revalidateNewsPaths();

    return NextResponse.json({ post: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
