import { NextResponse } from "next/server";

import { ApiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { revalidateHeroPaths } from "@/lib/revalidate-public";
import {
  HERO_ADMIN_SELECT,
  MAX_HERO_IMAGE_BYTES,
  deleteHeroImageFile,
  mapHeroImageError,
  saveHeroImage,
} from "@/lib/storage/hero-slide";

type RouteContext = { params: Promise<{ id: string }> };

/** Replace the binary for an existing hero slide. */
export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Hero slide not found", 404);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError("Image file is required", 400);
    }
    if (file.size > MAX_HERO_IMAGE_BYTES) {
      throw new ApiError("Image must be 16 MB or smaller.", 400);
    }

    try {
      const saved = await saveHeroImage({
        id,
        buffer: Buffer.from(await file.arrayBuffer()),
        declaredMime: file.type || "",
      });

      // Extension may change (e.g. png -> jpg): remove the stale file.
      if (existing.imagePath && existing.imagePath !== saved.imagePath) {
        await deleteHeroImageFile(existing.imagePath);
      }

      const slide = await prisma.heroSlide.update({
        where: { id },
        data: saved,
        select: HERO_ADMIN_SELECT,
      });
      revalidateHeroPaths();
      return NextResponse.json({ slide });
    } catch (err) {
      return handleApiError(mapHeroImageError(err));
    }
  } catch (error) {
    return handleApiError(error);
  }
}
