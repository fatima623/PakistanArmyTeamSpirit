import { NextResponse } from "next/server";

import {
  parseTranslationsFormField,
  parseTranslationsInput,
  saveTranslations,
} from "@/lib/admin-translations";
import {
  ApiError,
  handleApiError,
  requireAdmin,
} from "@/lib/api-helpers";
import { deleteTranslationsFor } from "@/lib/i18n/content-translations";
import { prisma } from "@/lib/prisma";
import { revalidateGalleryPaths } from "@/lib/revalidate-public";
import { GalleryImageSchema } from "@/lib/validations";
import {
  GALLERY_ADMIN_SELECT,
  MAX_GALLERY_IMAGE_BYTES,
  deleteGalleryImageFile,
  saveGalleryImage,
} from "@/lib/storage/gallery-image";

/** Normalise a multipart boolean field ("true"/"false"/"on"). */
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

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mapImageError(error: unknown): ApiError | unknown {
  if (error instanceof Error) {
    if (error.message === "INVALID_IMAGE") {
      return new ApiError(
        "Unsupported or invalid image. Use a JPG, PNG, WEBP or GIF.",
        400
      );
    }
    if (error.message === "FILE_TOO_LARGE") {
      return new ApiError("Image must be 8 MB or smaller.", 400);
    }
  }
  return error;
}

export async function GET() {
  try {
    await requireAdmin();
    const images = await prisma.galleryImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: GALLERY_ADMIN_SELECT,
    });
    return NextResponse.json({ images });
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
    if (file.size > MAX_GALLERY_IMAGE_BYTES) {
      throw new ApiError("Image must be 8 MB or smaller.", 400);
    }

    const parsed = GalleryImageSchema.safeParse({
      title: formString(formData.get("title")),
      caption: formString(formData.get("caption")),
      year: formString(formData.get("year")),
      category: formString(formData.get("category")),
      sortOrder: formData.get("sortOrder") ?? undefined,
      published: formBool(formData.get("published")),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Validated before the row exists: a bad locale/field must 400 rather than
    // leave a half-created image behind.
    const translations = parseTranslationsInput(
      "GalleryImage",
      parseTranslationsFormField(formData.get("translations"))
    );

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = parsed.data;

    // Create the row first so the file can be named by its stable id.
    const created = await prisma.galleryImage.create({
      data: {
        title: data.title,
        caption: emptyToNull(data.caption),
        year: data.year ?? null,
        category: emptyToNull(data.category),
        imagePath: "",
        imageMimeType: "",
        imageFileSize: 0,
        sortOrder: data.sortOrder ?? 0,
        published: data.published ?? true,
      },
    });

    let savedPath: string | null = null;
    try {
      const saved = await saveGalleryImage({
        id: created.id,
        buffer,
        declaredMime: file.type || "",
      });
      savedPath = saved.imagePath;
      await saveTranslations({
        model: "GalleryImage",
        recordId: created.id,
        translations,
        source: { title: created.title, caption: created.caption },
      });
      const image = await prisma.galleryImage.update({
        where: { id: created.id },
        data: saved,
        select: GALLERY_ADMIN_SELECT,
      });
      revalidateGalleryPaths();
      return NextResponse.json({ image }, { status: 201 });
    } catch (err) {
      // Roll back the row, its translations and any file written before the
      // failure.
      await prisma.galleryImage
        .delete({ where: { id: created.id } })
        .catch(() => undefined);
      await deleteTranslationsFor("GalleryImage", created.id).catch(
        () => undefined
      );
      if (savedPath) {
        await deleteGalleryImageFile(savedPath).catch(() => undefined);
      }
      return handleApiError(mapImageError(err));
    }
  } catch (error) {
    return handleApiError(error);
  }
}
