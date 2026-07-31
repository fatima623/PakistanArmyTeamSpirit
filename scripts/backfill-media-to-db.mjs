/**
 * One-time backfill: copies media that currently lives only on the local disk
 * (uploads/gallery|events|hero|news) into the new DB binary columns, so content
 * uploaded before the DB-storage migration shows up on serverless hosts (Vercel)
 * that share this same Aiven database.
 *
 * Safe to re-run: it overwrites the DB blob with the on-disk bytes for any row
 * whose id matches a file. Files with no matching DB row are skipped.
 *
 *   node scripts/backfill-media-to-db.mjs
 */
import { PrismaClient } from "@prisma/client";
import { readFile, readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseName(file) {
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  const isPoster = base.endsWith("-poster");
  const id = isPoster ? base.slice(0, -"-poster".length) : base;
  return { id, isPoster };
}

async function backfillDir(dir, handler) {
  const abs = path.join(ROOT, "uploads", dir);
  let files;
  try {
    files = await readdir(abs);
  } catch {
    return;
  }
  console.log(`\n[${dir}]`);
  for (const file of files) {
    if (file === ".gitkeep") continue;
    const { id, isPoster } = parseName(file);
    const buffer = await readFile(path.join(abs, file));
    try {
      await handler(id, isPoster, buffer);
      console.log(`  ✓ ${file} (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.warn(`  ✗ ${file}: ${e.message}`);
    }
  }
}

async function main() {
  await backfillDir("gallery", async (id, isPoster, buffer) => {
    const row = await prisma.galleryImage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!row) throw new Error("no matching gallery row");
    await prisma.galleryImage.update({
      where: { id },
      data: isPoster ? { posterData: buffer } : { imageData: buffer },
    });
  });

  await backfillDir("events", async (id, _isPoster, buffer) => {
    const row = await prisma.event.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!row) throw new Error("no matching event row");
    await prisma.event.update({
      where: { id },
      data: { thumbnailData: buffer },
    });
  });

  await backfillDir("hero", async (id, _isPoster, buffer) => {
    const row = await prisma.heroSlide.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!row) throw new Error("no matching hero row");
    await prisma.heroSlide.update({
      where: { id },
      data: { imageData: buffer },
    });
  });

  await backfillDir("news", async (id, _isPoster, buffer) => {
    const row = await prisma.newsPost.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!row) throw new Error("no matching news row");
    await prisma.newsPost.update({
      where: { id },
      data: { imageData: buffer },
    });
  });

  console.log("\nBackfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
