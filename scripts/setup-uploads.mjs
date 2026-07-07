/**
 * Creates upload folder structure on fresh clone / npm install.
 * Run via package.json postinstall, dev, start, and build.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const dirs = [
  "uploads/payment-proofs",
  "storage/news-pdfs",
  "uploads/flight-docs",
];

for (const dir of dirs) {
  fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
}

console.log("[setup-uploads] Upload directories ready");
