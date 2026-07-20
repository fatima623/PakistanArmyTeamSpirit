import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import type { Prisma } from "@prisma/client";

export const MAX_GALLERY_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
/**
 * Videos are read fully into a Buffer before writing (same as images), so this
 * ceiling is a memory budget as much as a policy. Raise with care.
 */
export const MAX_GALLERY_VIDEO_BYTES = 128 * 1024 * 1024; // 128 MB
export const MIN_GALLERY_IMAGE_BYTES = 512;

/** Public URL prefix — media is served through the /uploads/[...path] route. */
const GALLERY_DIR_NAME = "gallery";

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const VIDEO_MIME_TO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const MIME_TO_EXT: Record<string, string> = {
  ...IMAGE_MIME_TO_EXT,
  ...VIDEO_MIME_TO_EXT,
};

export const ALLOWED_GALLERY_MIME_TYPES = Object.keys(IMAGE_MIME_TO_EXT);
export const ALLOWED_GALLERY_VIDEO_MIME_TYPES = Object.keys(VIDEO_MIME_TO_EXT);
export const ALLOWED_GALLERY_MEDIA_MIME_TYPES = Object.keys(MIME_TO_EXT);

export type GalleryMediaType = "image" | "video";

/** Scalar fields surfaced to the admin manager (matches AdminGalleryImage). */
export const GALLERY_ADMIN_SELECT = {
  id: true,
  title: true,
  caption: true,
  year: true,
  category: true,
  mediaType: true,
  imagePath: true,
  posterPath: true,
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

/** Poster frames sit beside the video under a `-poster` suffix. */
export function galleryPosterRelativePath(id: string, mime: string): string {
  const ext = IMAGE_MIME_TO_EXT[mime] ?? "jpg";
  return `${GALLERY_DIR_NAME}/${id}-poster.${ext}`;
}

/** Public URL for a stored relative path. */
export function galleryImageUrl(imagePath: string): string {
  return `/uploads/${imagePath}`;
}

export function mediaTypeForMime(mime: string): GalleryMediaType | null {
  if (mime in IMAGE_MIME_TO_EXT) return "image";
  if (mime in VIDEO_MIME_TO_EXT) return "video";
  return null;
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

function detectVideoMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  // Matroska / WebM share the EBML header 1A 45 DF A3. Distinguishing the two
  // needs a DocType scan; we accept the container as WebM, which is what
  // browsers can actually decode from a .webm upload.
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "video/webm";
  }
  // ISO base media (MP4 / MOV): bytes 4..7 spell "ftyp".
  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    // Major brand at 8..11 — "qt  " means QuickTime, everything else is MP4.
    const brand = buffer.subarray(8, 12).toString("latin1");
    return brand.startsWith("qt") ? "video/quicktime" : "video/mp4";
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

/**
 * Sniffs an image *or* video buffer. Same contract as the image-only variant:
 * the sniffed type wins, and the declared type only has to not contradict it.
 */
export function validateGalleryMediaBuffer(
  buffer: Buffer,
  declaredMime: string
): { mime: string; mediaType: GalleryMediaType } {
  if (buffer.length <= MIN_GALLERY_IMAGE_BYTES) {
    throw new Error("INVALID_MEDIA");
  }
  const sniffed = detectImageMime(buffer) ?? detectVideoMime(buffer);
  if (!sniffed) {
    throw new Error("INVALID_MEDIA");
  }
  const mediaType = mediaTypeForMime(sniffed);
  if (!mediaType) {
    throw new Error("INVALID_MEDIA");
  }
  if (
    declaredMime &&
    !ALLOWED_GALLERY_MEDIA_MIME_TYPES.includes(declaredMime)
  ) {
    throw new Error("INVALID_MEDIA");
  }
  // A declared image that sniffs as video (or vice versa) is a mismatch worth
  // rejecting outright rather than silently reclassifying.
  if (declaredMime && mediaTypeForMime(declaredMime) !== mediaType) {
    throw new Error("INVALID_MEDIA");
  }
  const limit =
    mediaType === "video" ? MAX_GALLERY_VIDEO_BYTES : MAX_GALLERY_IMAGE_BYTES;
  if (buffer.length > limit) {
    throw new Error("FILE_TOO_LARGE");
  }
  return { mime: sniffed, mediaType };
}

export type GalleryImageSaveResult = {
  imagePath: string;
  imageMimeType: string;
  imageFileSize: number;
};

export type GalleryMediaSaveResult = GalleryImageSaveResult & {
  mediaType: GalleryMediaType;
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

/** Saves an image or a video, returning which kind it turned out to be. */
export async function saveGalleryMedia(input: {
  id: string;
  buffer: Buffer;
  declaredMime: string;
}): Promise<GalleryMediaSaveResult> {
  const { id, buffer, declaredMime } = input;
  const { mime, mediaType } = validateGalleryMediaBuffer(buffer, declaredMime);

  const root = getGalleryStorageRoot();
  await mkdir(root, { recursive: true });

  const relativePath = galleryRelativePath(id, mime);
  const absolutePath = path.join(root, path.basename(relativePath));
  await writeFile(absolutePath, buffer);

  return {
    imagePath: relativePath,
    imageMimeType: mime,
    imageFileSize: buffer.length,
    mediaType,
  };
}

export type GalleryPosterSaveResult = {
  posterPath: string;
  posterMimeType: string;
  posterFileSize: number;
};

/** Poster frames are always stills, so they reuse the image validator. */
export async function saveGalleryPoster(input: {
  id: string;
  buffer: Buffer;
  declaredMime: string;
}): Promise<GalleryPosterSaveResult> {
  const { id, buffer, declaredMime } = input;

  if (buffer.length > MAX_GALLERY_IMAGE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const mime = validateGalleryImageBuffer(buffer, declaredMime);

  const root = getGalleryStorageRoot();
  await mkdir(root, { recursive: true });

  const relativePath = galleryPosterRelativePath(id, mime);
  const absolutePath = path.join(root, path.basename(relativePath));
  await writeFile(absolutePath, buffer);

  return {
    posterPath: relativePath,
    posterMimeType: mime,
    posterFileSize: buffer.length,
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
