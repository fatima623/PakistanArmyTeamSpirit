/**
 * Ensures upload directories exist. Safe to call on every server start / npm install.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";

import { UPLOAD_DIR_NAMES } from "@/lib/storage/upload-dir-names";

export { UPLOAD_DIR_NAMES } from "@/lib/storage/upload-dir-names";

export function ensureUploadDirs(cwd = process.cwd()): void {
  for (const dir of UPLOAD_DIR_NAMES) {
    mkdirSync(path.join(cwd, dir), { recursive: true });
  }
}
