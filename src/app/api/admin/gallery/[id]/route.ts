import { NextResponse } from "next/server";

import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { revalidateGalleryPaths } from "@/lib/revalidate-public";
import { GalleryImageUpdateSchema } from "@/lib/validations";
import {
  GALLERY_ADMIN_SELECT,
  deleteGalleryImageFile,
} from "@/lib/storage/gallery-image";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const { id } = await context.params;

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Gallery image not found", 404);
    }

    const body = await request.json();
    const parsed = GalleryImageUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const image = await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.caption !== undefined
          ? { caption: d.caption.trim() ? d.caption.trim() : null }
          : {}),
        ...(d.year !== undefined ? { year: d.year ?? null } : {}),
        ...(d.category !== undefined
          ? { category: d.category.trim() ? d.category.trim() : null }
          : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        ...(d.published !== undefined ? { published: d.published } : {}),
      },
      select: GALLERY_ADMIN_SELECT,
    });

    revalidateGalleryPaths();
    return NextResponse.json({ image });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Gallery image not found", 404);
    }

    await deleteGalleryImageFile(existing.imagePath);
    await prisma.galleryImage.delete({ where: { id } });

    revalidateGalleryPaths();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
