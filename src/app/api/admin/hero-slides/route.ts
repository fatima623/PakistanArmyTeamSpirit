import { NextResponse } from "next/server";

import { ApiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { revalidateHeroPaths } from "@/lib/revalidate-public";
import { HeroSlideSchema } from "@/lib/validations";
import {
  DEFAULT_HERO_PLACEMENT,
  HERO_ADMIN_SELECT,
  MAX_HERO_IMAGE_BYTES,
  deleteHeroImageFile,
  mapHeroImageError,
  resolveHeroPlacement,
  saveHeroImage,
} from "@/lib/storage/hero-slide";

function formBool(value: FormDataEntryValue | null): boolean | undefined {
  if (value == null) return undefined;
  const v = String(value).toLowerCase();
  if (v === "false" || v === "0" || v === "off") return false;
  if (v === "true" || v === "1" || v === "on") return true;
  return undefined;
}

function formString(value: FormDataEntryValue | null): string {
  return value == null ? "" : String(value);
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const placement = resolveHeroPlacement(
      new URL(request.url).searchParams.get("placement") ??
        DEFAULT_HERO_PLACEMENT
    );
    const slides = await prisma.heroSlide.findMany({
      where: { placement },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: HERO_ADMIN_SELECT,
    });
    return NextResponse.json({ slides });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError("Image file is required", 400);
    }
    if (file.size > MAX_HERO_IMAGE_BYTES) {
      throw new ApiError("Image must be 16 MB or smaller.", 400);
    }

    const parsed = HeroSlideSchema.safeParse({
      title: formString(formData.get("title")),
      alt: formString(formData.get("alt")),
      placement: resolveHeroPlacement(
        formData.get("placement") ?? DEFAULT_HERO_PLACEMENT
      ),
      sortOrder: formData.get("sortOrder") ?? undefined,
      published: formBool(formData.get("published")),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = parsed.data;

    // Row first so the file can be named by its stable id, matching the gallery.
    const created = await prisma.heroSlide.create({
      data: {
        title: data.title,
        alt: data.alt?.trim() ? data.alt.trim() : null,
        placement: data.placement ?? DEFAULT_HERO_PLACEMENT,
        imagePath: "",
        imageMimeType: "",
        imageFileSize: 0,
        sortOrder: data.sortOrder ?? 0,
        published: data.published ?? true,
      },
    });

    let savedPath: string | null = null;
    try {
      const saved = await saveHeroImage({
        id: created.id,
        buffer,
        declaredMime: file.type || "",
      });
      savedPath = saved.imagePath;
      const slide = await prisma.heroSlide.update({
        where: { id: created.id },
        data: saved,
        select: HERO_ADMIN_SELECT,
      });
      revalidateHeroPaths();
      return NextResponse.json({ slide }, { status: 201 });
    } catch (err) {
      await prisma.heroSlide
        .delete({ where: { id: created.id } })
        .catch(() => undefined);
      if (savedPath) {
        await deleteHeroImageFile(savedPath).catch(() => undefined);
      }
      return handleApiError(mapHeroImageError(err));
    }
  } catch (error) {
    return handleApiError(error);
  }
}
