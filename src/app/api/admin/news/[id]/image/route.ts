import { NextResponse } from "next/server";

import { ApiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { revalidateNewsPaths } from "@/lib/revalidate-public";
import {
  deleteNewsImageFile,
  MAX_NEWS_IMAGE_BYTES,
  saveNewsImage,
} from "@/lib/storage/news-image";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const post = await prisma.newsPost.findUnique({ where: { id } });
    if (!post) throw new ApiError("News post not found", 404);

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new ApiError("Image file is required", 400);
    if (file.size > MAX_NEWS_IMAGE_BYTES)
      throw new ApiError("Image must be 8 MB or smaller.", 400);
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const saved = await saveNewsImage({
        id,
        buffer,
        declaredMime: file.type || "",
      });
      if (post.imagePath && post.imagePath !== saved.imagePath)
        await deleteNewsImageFile(post.imagePath);
      const updated = await prisma.newsPost.update({
        where: { id },
        data: saved,
      });
      revalidateNewsPaths();
      return NextResponse.json({ post: updated });
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_IMAGE")
        return handleApiError(
          new ApiError(
            "Unsupported or invalid image. Use a JPG, PNG, WEBP or GIF.",
            400
          )
        );
      if (err instanceof Error && err.message === "FILE_TOO_LARGE")
        return handleApiError(new ApiError("Image must be 8 MB or smaller.", 400));
      return handleApiError(err);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const post = await prisma.newsPost.findUnique({ where: { id } });
    if (!post) throw new ApiError("News post not found", 404);

    if (post.imagePath) await deleteNewsImageFile(post.imagePath);
    const updated = await prisma.newsPost.update({
      where: { id },
      data: { imagePath: null, imageMimeType: null, imageFileSize: null },
    });
    revalidateNewsPaths();
    return NextResponse.json({ post: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
