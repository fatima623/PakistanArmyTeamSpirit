import { NextResponse } from "next/server";

import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { revalidateHeroPaths } from "@/lib/revalidate-public";
import { HeroSlideUpdateSchema } from "@/lib/validations";
import {
  HERO_ADMIN_SELECT,
  deleteHeroImageFile,
} from "@/lib/storage/hero-slide";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const { id } = await context.params;

    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Hero slide not found", 404);
    }

    const parsed = HeroSlideUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.alt !== undefined
          ? { alt: d.alt.trim() ? d.alt.trim() : null }
          : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        ...(d.published !== undefined ? { published: d.published } : {}),
      },
      select: HERO_ADMIN_SELECT,
    });

    revalidateHeroPaths();
    return NextResponse.json({ slide });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Hero slide not found", 404);
    }

    await deleteHeroImageFile(existing.imagePath);
    await prisma.heroSlide.delete({ where: { id } });

    revalidateHeroPaths();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
