/**
 * Seeds the four bundled hero images as editable `HeroSlide` rows.
 *
 * Copies each file out of `public/` into `uploads/hero/` so the admin can
 * reorder, replace or delete them like any uploaded slide. Idempotent by title:
 * re-running refreshes the existing rows instead of duplicating them.
 *
 * The storage helper is deliberately not imported — it pulls in `api-helpers`,
 * which reaches for `next/server` and auth and cannot load outside a request.
 *
 * Run with: npm run db:seed:hero
 */
import { copyFile, mkdir, stat } from "fs/promises";
import path from "path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROOT = path.join(__dirname, "..");
const HERO_UPLOAD_DIR = path.join(ROOT, "uploads", "hero");

const SLIDES = [
  { title: "Patrol column — ridge line", source: "public/media/pats/crops/home2.jpeg" },
  { title: "Team briefing — first light", source: "public/media/pats/crops/hero-hmz1.jpeg" },
  { title: "River crossing", source: "public/media/pats/crops/home3.jpeg" },
  { title: "Night navigation stand", source: "public/media/pats/crops/hero-hmz2.jpeg" },
];

async function main() {
  await mkdir(HERO_UPLOAD_DIR, { recursive: true });

  let created = 0;
  let updated = 0;

  for (const [index, slide] of SLIDES.entries()) {
    const absoluteSource = path.join(ROOT, slide.source);
    let size: number;
    try {
      size = (await stat(absoluteSource)).size;
    } catch {
      console.warn(`  skipped — missing source file: ${slide.source}`);
      continue;
    }

    const existing = await prisma.heroSlide.findFirst({
      where: { title: slide.title },
      select: { id: true },
    });

    // Create first (when new) so the stored file can be named by the row id.
    const id =
      existing?.id ??
      (
        await prisma.heroSlide.create({
          data: {
            title: slide.title,
            imagePath: "",
            imageMimeType: "",
            imageFileSize: 0,
            sortOrder: index,
            published: true,
          },
          select: { id: true },
        })
      ).id;

    const imagePath = `hero/${id}.jpg`;
    await copyFile(absoluteSource, path.join(HERO_UPLOAD_DIR, `${id}.jpg`));

    await prisma.heroSlide.update({
      where: { id },
      data: {
        title: slide.title,
        imagePath,
        imageMimeType: "image/jpeg",
        imageFileSize: size,
        sortOrder: index,
        published: true,
      },
    });

    if (existing) updated += 1;
    else created += 1;
  }

  console.log(`Hero seed complete — ${created} created, ${updated} updated.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
