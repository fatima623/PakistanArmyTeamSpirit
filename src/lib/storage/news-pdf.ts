import { existsSync } from "fs";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

import {
  MAX_NEWS_PDF_BYTES,
  MIN_NEWS_PDF_BYTES,
} from "@/lib/news-pdf-constants";

export { MAX_NEWS_PDF_BYTES, MIN_NEWS_PDF_BYTES };

const PDF_MIME = "application/pdf";

export function getNewsPdfStorageRoot(): string {
  const configured = process.env.NEWS_PDF_STORAGE_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "storage", "news-pdfs");
}

export function newsPdfFileName(postId: string): string {
  return `${postId}.pdf`;
}

/** Resolve a stored pdfPath (relative or legacy absolute) to an on-disk file. */
export function resolveNewsPdfAbsolutePath(
  storedPath: string | null | undefined,
  postId?: string
): string | null {
  const root = path.resolve(getNewsPdfStorageRoot());

  const candidates: string[] = [];

  if (storedPath?.trim()) {
    const trimmed = storedPath.trim();
    if (path.isAbsolute(trimmed)) {
      candidates.push(path.resolve(trimmed));
      candidates.push(path.join(root, path.basename(trimmed)));
    } else {
      candidates.push(path.join(root, trimmed));
    }
  }

  if (postId) {
    candidates.push(path.join(root, newsPdfFileName(postId)));
  }

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (
      (resolved === root || resolved.startsWith(root + path.sep)) &&
      existsSync(resolved)
    ) {
      return resolved;
    }
  }

  return null;
}

function detectPdfMagic(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  );
}

/** Validates buffer before persisting — throws INVALID_PDF on any failure. */
export function validateNewsPdfBuffer(
  buffer: Buffer,
  declaredMime: string
): void {
  if (buffer.length <= MIN_NEWS_PDF_BYTES) {
    throw new Error("INVALID_PDF");
  }
  if (declaredMime !== PDF_MIME) {
    throw new Error("INVALID_PDF");
  }
  if (!detectPdfMagic(buffer)) {
    throw new Error("INVALID_PDF");
  }
}

export type NewsPdfSaveInput = {
  postId: string;
  buffer: Buffer;
  originalFileName: string;
  declaredMime: string;
};

export type NewsPdfSaveResult = {
  pdfPath: string;
  pdfOriginalName: string;
  pdfMimeType: string;
  pdfFileSize: number;
};

export async function saveNewsPdf(
  input: NewsPdfSaveInput
): Promise<NewsPdfSaveResult> {
  const { postId, buffer, originalFileName, declaredMime } = input;

  if (buffer.length > MAX_NEWS_PDF_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  validateNewsPdfBuffer(buffer, declaredMime);

  const root = getNewsPdfStorageRoot();
  await mkdir(root, { recursive: true });

  const relativePath = newsPdfFileName(postId);
  const absolutePath = path.join(root, relativePath);
  await writeFile(absolutePath, buffer);

  const safeName =
    originalFileName.replace(/[^\w.\- ()]/g, "_").slice(0, 200) ||
    "attachment.pdf";

  return {
    pdfPath: relativePath,
    pdfOriginalName: safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`,
    pdfMimeType: PDF_MIME,
    pdfFileSize: buffer.length,
  };
}

export async function readNewsPdf(
  pdfPath: string | null | undefined,
  postId?: string
): Promise<Buffer> {
  const absolute = resolveNewsPdfAbsolutePath(pdfPath, postId);
  if (!absolute) {
    throw new Error("PDF_FILE_NOT_FOUND");
  }
  return readFile(absolute);
}

export async function deleteNewsPdfFile(
  pdfPath: string | null | undefined,
  postId?: string
) {
  const absolute = resolveNewsPdfAbsolutePath(pdfPath, postId);
  if (!absolute) return;
  try {
    await unlink(absolute);
  } catch {
    /* ignore missing file */
  }
}
