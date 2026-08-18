/**
 * Ensures upload directories exist. Safe to call on every server start / npm install.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";

import { UPLOAD_DIR_NAMES } from "@/lib/storage/upload-dir-names";

export { UPLOAD_DIR_NAMES } from "@/lib/storage/upload-dir-names";

/**
 * Best-effort: serverless hosts (Vercel) mount the bundle read-only, so the
 * mkdir throws EROFS/ENOENT there. That must never fail the request — the
 * binaries those routes handle are persisted to the database, and the local
 * directories are only the development/self-hosted convenience copy.
 */
export function ensureUploadDirs(cwd = process.cwd()): void {
  for (const dir of UPLOAD_DIR_NAMES) {
    try {
      mkdirSync(path.join(cwd, dir), { recursive: true });
    } catch {
      /* read-only filesystem — nothing to do */
    }
  }
}
