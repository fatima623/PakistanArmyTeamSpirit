import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const MAX_NEWS_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MIN_NEWS_IMAGE_BYTES = 512;

/** Public URL prefix — announcement images are served via the /uploads/[...path] route. */
const NEWS_IMAGE_DIR_NAME = "news";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const ALLOWED_NEWS_IMAGE_MIME_TYPES = Object.keys(MIME_TO_EXT);

export function getNewsImageStorageRoot(): string {
  // Must stay under <cwd>/uploads so the /uploads/[...path] route can serve it back.
  return path.join(process.cwd(), "uploads", NEWS_IMAGE_DIR_NAME);
}

/** Relative path stored in the DB (also the tail of the public URL). */
export function newsImageRelativePath(id: string, mime: string): string {
  const ext = MIME_TO_EXT[mime] ?? "jpg";
  return `${NEWS_IMAGE_DIR_NAME}/${id}.${ext}`;
}

/** Public URL for a stored relative path. */
export function newsImageUrl(imagePath: string): string {
  return `/uploads/${imagePath}`;
}

function detectImageMime(buffer: Buffer): string | null {
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
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
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

/** Returns the sniffed mime; throws INVALID_IMAGE on any failure. */
export function validateNewsImageBuffer(
  buffer: Buffer,
  declaredMime: string
): string {
  if (buffer.length <= MIN_NEWS_IMAGE_BYTES) {
    throw new Error("INVALID_IMAGE");
  }
  const sniffed = detectImageMime(buffer);
  if (!sniffed) {
    throw new Error("INVALID_IMAGE");
  }
  if (declaredMime && !ALLOWED_NEWS_IMAGE_MIME_TYPES.includes(declaredMime)) {
    throw new Error("INVALID_IMAGE");
  }
  return sniffed;
}

export type NewsImageSaveResult = {
  imagePath: string;
  imageMimeType: string;
  imageFileSize: number;
};

export async function saveNewsImage(input: {
  id: string;
  buffer: Buffer;
  declaredMime: string;
}): Promise<NewsImageSaveResult> {
  const { id, buffer, declaredMime } = input;

  if (buffer.length > MAX_NEWS_IMAGE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const mime = validateNewsImageBuffer(buffer, declaredMime);

  const root = getNewsImageStorageRoot();
  await mkdir(root, { recursive: true });

  const relativePath = newsImageRelativePath(id, mime);
  const fileName = path.basename(relativePath);
  const absolutePath = path.join(root, fileName);
  await writeFile(absolutePath, buffer);

  return {
    imagePath: relativePath,
    imageMimeType: mime,
    imageFileSize: buffer.length,
  };
}

export async function deleteNewsImageFile(
  imagePath: string | null | undefined
) {
  if (!imagePath?.trim()) return;
  const root = path.resolve(getNewsImageStorageRoot());
  const absolute = path.resolve(path.join(root, path.basename(imagePath)));
  if (absolute !== root && !absolute.startsWith(root + path.sep)) return;
  if (!existsSync(absolute)) return;
  try {
    await unlink(absolute);
  } catch {
    /* ignore missing file */
  }
}
