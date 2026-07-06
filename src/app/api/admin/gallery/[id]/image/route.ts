import { NextResponse } from "next/server";

import {
  ApiError,
  handleApiError,
  requireAdmin,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { revalidateGalleryPaths } from "@/lib/revalidate-public";
import {
  GALLERY_ADMIN_SELECT,
  MAX_GALLERY_IMAGE_BYTES,
  deleteGalleryImageFile,
  saveGalleryImage,
} from "@/lib/storage/gallery-image";

type RouteContext = { params: Promise<{ id: string }> };

/** Replace the binary for an existing gallery image. */
export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Gallery image not found", 404);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError("Image file is required", 400);
    }
    if (file.size > MAX_GALLERY_IMAGE_BYTES) {
      throw new ApiError("Image must be 8 MB or smaller.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const saved = await saveGalleryImage({
        id,
        buffer,
        declaredMime: file.type || "",
      });

      // Extension may change (e.g. png -> jpg): remove the stale file.
      if (existing.imagePath && existing.imagePath !== saved.imagePath) {
        await deleteGalleryImageFile(existing.imagePath);
      }

      const image = await prisma.galleryImage.update({
        where: { id },
        data: saved,
        select: GALLERY_ADMIN_SELECT,
      });
      revalidateGalleryPaths();
      return NextResponse.json({ image });
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_IMAGE") {
        return handleApiError(
          new ApiError(
            "Unsupported or invalid image. Use a JPG, PNG, WEBP or GIF.",
            400
          )
        );
      }
      if (err instanceof Error && err.message === "FILE_TOO_LARGE") {
        return handleApiError(new ApiError("Image must be 8 MB or smaller.", 400));
      }
      return handleApiError(err);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
