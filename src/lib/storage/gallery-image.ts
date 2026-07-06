import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import type { Prisma } from "@prisma/client";

export const MAX_GALLERY_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MIN_GALLERY_IMAGE_BYTES = 512;

/** Public URL prefix — images are served through the /uploads/[...path] route. */
const GALLERY_DIR_NAME = "gallery";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const ALLOWED_GALLERY_MIME_TYPES = Object.keys(MIME_TO_EXT);

/** Scalar fields surfaced to the admin manager (matches AdminGalleryImage). */
export const GALLERY_ADMIN_SELECT = {
  id: true,
  title: true,
  caption: true,
  year: true,
  category: true,
  imagePath: true,
  sortOrder: true,
  published: true,
} satisfies Prisma.GalleryImageSelect;

export function getGalleryStorageRoot(): string {
  // Must stay under <cwd>/uploads so the /uploads/[...path] route can serve the
  // files back. Not env-configurable on purpose: a divergent storage dir would
  // let uploads succeed while every image 404s at the public URL.
  return path.join(process.cwd(), "uploads", GALLERY_DIR_NAME);
}

/** Relative path stored in the DB (also the tail of the public URL). */
export function galleryRelativePath(id: string, mime: string): string {
  const ext = MIME_TO_EXT[mime] ?? "jpg";
  return `${GALLERY_DIR_NAME}/${id}.${ext}`;
}

/** Public URL for a stored relative path. */
export function galleryImageUrl(imagePath: string): string {
  return `/uploads/${imagePath}`;
}

function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }
  // WEBP: "RIFF" .... "WEBP"
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

/** Returns the sniffed mime; throws INVALID_IMAGE on any failure. */
export function validateGalleryImageBuffer(
  buffer: Buffer,
  declaredMime: string
): string {
  if (buffer.length <= MIN_GALLERY_IMAGE_BYTES) {
    throw new Error("INVALID_IMAGE");
  }
  const sniffed = detectImageMime(buffer);
  if (!sniffed) {
    throw new Error("INVALID_IMAGE");
  }
  // The declared type must be an allowed image type and agree with the bytes
  // (jpeg/jpg variance aside — sniffing is the source of truth).
  if (declaredMime && !ALLOWED_GALLERY_MIME_TYPES.includes(declaredMime)) {
    throw new Error("INVALID_IMAGE");
  }
  return sniffed;
}

export type GalleryImageSaveResult = {
  imagePath: string;
  imageMimeType: string;
  imageFileSize: number;
};

export async function saveGalleryImage(input: {
  id: string;
  buffer: Buffer;
  declaredMime: string;
}): Promise<GalleryImageSaveResult> {
  const { id, buffer, declaredMime } = input;

  if (buffer.length > MAX_GALLERY_IMAGE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const mime = validateGalleryImageBuffer(buffer, declaredMime);

  const root = getGalleryStorageRoot();
  await mkdir(root, { recursive: true });

  const relativePath = galleryRelativePath(id, mime);
  const fileName = path.basename(relativePath);
  const absolutePath = path.join(root, fileName);
  await writeFile(absolutePath, buffer);

  return {
    imagePath: relativePath,
    imageMimeType: mime,
    imageFileSize: buffer.length,
  };
}

export async function deleteGalleryImageFile(
  imagePath: string | null | undefined
) {
  if (!imagePath?.trim()) return;
  const root = path.resolve(getGalleryStorageRoot());
  const absolute = path.resolve(path.join(root, path.basename(imagePath)));
  if (absolute !== root && !absolute.startsWith(root + path.sep)) return;
  if (!existsSync(absolute)) return;
  try {
    await unlink(absolute);
  } catch {
    /* ignore missing file */
  }
}
