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
  MAX_GALLERY_VIDEO_BYTES,
  deleteGalleryImageFile,
  saveGalleryMedia,
  saveGalleryPoster,
} from "@/lib/storage/gallery-image";

type RouteContext = { params: Promise<{ id: string }> };

/** Replace the binary (image or video) for an existing gallery item. */
export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Gallery item not found", 404);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const posterEntry = formData.get("poster");
    const poster =
      posterEntry instanceof File && posterEntry.size > 0 ? posterEntry : null;

    // Either the media or just the poster may be replaced on its own.
    if (!(file instanceof File) && !poster) {
      throw new ApiError("A file is required", 400);
    }
    if (file instanceof File && file.size > MAX_GALLERY_VIDEO_BYTES) {
      throw new ApiError("File must be 128 MB or smaller.", 400);
    }

    try {
      let mediaFields = {};
      let nextMediaType = existing.mediaType;

      if (file instanceof File) {
        const saved = await saveGalleryMedia({
          id,
          buffer: Buffer.from(await file.arrayBuffer()),
          declaredMime: file.type || "",
        });
        // Extension may change (e.g. png -> jpg, or image -> mp4): remove the
        // stale file so the directory does not accumulate orphans.
        if (existing.imagePath && existing.imagePath !== saved.imagePath) {
          await deleteGalleryImageFile(existing.imagePath);
        }
        mediaFields = saved;
        nextMediaType = saved.mediaType;
      }

      let posterFields = {};
      if (poster && nextMediaType === "video") {
        const savedPoster = await saveGalleryPoster({
          id,
          buffer: Buffer.from(await poster.arrayBuffer()),
          declaredMime: poster.type || "",
        });
        if (
          existing.posterPath &&
          existing.posterPath !== savedPoster.posterPath
        ) {
          await deleteGalleryImageFile(existing.posterPath);
        }
        posterFields = savedPoster;
      } else if (nextMediaType === "image" && existing.posterPath) {
        // Switching a video back to a still leaves the old poster dangling.
        await deleteGalleryImageFile(existing.posterPath);
        posterFields = {
          posterPath: null,
          posterMimeType: null,
          posterFileSize: null,
        };
      }

      const image = await prisma.galleryImage.update({
        where: { id },
        data: { ...mediaFields, ...posterFields },
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
      if (err instanceof Error && err.message === "INVALID_MEDIA") {
        return handleApiError(
          new ApiError(
            "Unsupported or invalid file. Use a JPG, PNG, WEBP or GIF image, or an MP4, WEBM or MOV video.",
            400
          )
        );
      }
      if (err instanceof Error && err.message === "FILE_TOO_LARGE") {
        return handleApiError(
          new ApiError(
            "Images must be 8 MB or smaller; videos 128 MB or smaller.",
            400
          )
        );
      }
      return handleApiError(err);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
