import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import type { Prisma } from "@prisma/client";

import { ApiError } from "@/lib/api-helpers";

/**
 * Hero art is full-bleed background imagery, so the ceiling is higher than the
 * gallery's 8 MB — a 2560px-wide JPEG routinely lands around 5–10 MB.
 */
export const MAX_HERO_IMAGE_BYTES = 16 * 1024 * 1024; // 16 MB
export const MIN_HERO_IMAGE_BYTES = 512;

const HERO_DIR_NAME = "hero";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ALLOWED_HERO_MIME_TYPES = Object.keys(MIME_TO_EXT);

export const HERO_ADMIN_SELECT = {
  id: true,
  title: true,
  alt: true,
  imagePath: true,
  sortOrder: true,
  published: true,
} satisfies Prisma.HeroSlideSelect;

export function getHeroStorageRoot(): string {
  return path.join(process.cwd(), "uploads", HERO_DIR_NAME);
}

export function heroRelativePath(id: string, mime: string): string {
  const ext = MIME_TO_EXT[mime] ?? "jpg";
  return `${HERO_DIR_NAME}/${id}.${ext}`;
}

export function heroImageUrl(imagePath: string): string {
  return `/uploads/${imagePath}`;
}

/**
 * GIF is deliberately absent: an animated hero background fights the crossfade
 * and there is no way to pause it for prefers-reduced-motion.
 */
function detectHeroMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function validateHeroImageBuffer(
  buffer: Buffer,
  declaredMime: string
): string {
  if (buffer.length <= MIN_HERO_IMAGE_BYTES) {
    throw new Error("INVALID_IMAGE");
  }
  if (buffer.length > MAX_HERO_IMAGE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const sniffed = detectHeroMime(buffer);
  if (!sniffed) {
    throw new Error("INVALID_IMAGE");
  }
  if (declaredMime && !ALLOWED_HERO_MIME_TYPES.includes(declaredMime)) {
    throw new Error("INVALID_IMAGE");
  }
  return sniffed;
}

export type HeroImageSaveResult = {
  imagePath: string;
  imageMimeType: string;
  imageFileSize: number;
};

export async function saveHeroImage(input: {
  id: string;
  buffer: Buffer;
  declaredMime: string;
}): Promise<HeroImageSaveResult> {
  const { id, buffer, declaredMime } = input;
  const mime = validateHeroImageBuffer(buffer, declaredMime);

  const root = getHeroStorageRoot();
  await mkdir(root, { recursive: true });

  const relativePath = heroRelativePath(id, mime);
  const absolutePath = path.join(root, path.basename(relativePath));
  await writeFile(absolutePath, buffer);

  return {
    imagePath: relativePath,
    imageMimeType: mime,
    imageFileSize: buffer.length,
  };
}

/** Translates this module's sentinel errors into user-facing API errors. */
export function mapHeroImageError(error: unknown): ApiError | unknown {
  if (error instanceof Error) {
    if (error.message === "INVALID_IMAGE") {
      return new ApiError(
        "Unsupported or invalid image. Use a JPG, PNG or WEBP.",
        400
      );
    }
    if (error.message === "FILE_TOO_LARGE") {
      return new ApiError("Image must be 16 MB or smaller.", 400);
    }
  }
  return error;
}

export async function deleteHeroImageFile(
  imagePath: string | null | undefined
) {
  if (!imagePath?.trim()) return;
  const root = path.resolve(getHeroStorageRoot());
  const absolute = path.resolve(path.join(root, path.basename(imagePath)));
  if (absolute !== root && !absolute.startsWith(root + path.sep)) return;
  if (!existsSync(absolute)) return;
  try {
    await unlink(absolute);
  } catch {
    /* ignore missing file */
  }
}
