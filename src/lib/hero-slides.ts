import type { HeroImage } from "@/components/hero/PatsHero";
import { prisma } from "@/lib/prisma";
import type { HeroPlacement } from "@/lib/storage/hero-slide";

/**
 * Published slides for one home-page carousel, in display order.
 *
 * Returns an empty array (rather than throwing) when the `HeroSlide` table has
 * not been migrated yet — the carousels then fall back to their bundled art, so
 * the home page never loses an image because of a pending migration.
 */
async function getSlides(placement: HeroPlacement): Promise<HeroImage[]> {
  try {
    const rows = await prisma.heroSlide.findMany({
      where: { placement, published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { imagePath: true, alt: true },
    });
    return rows.map((row) => ({
      src: `/uploads/${row.imagePath}`,
      alt: row.alt ?? "",
    }));
  } catch {
    return [];
  }
}

/** Full-bleed slides behind the home page headline. */
export function getHeroSlides(): Promise<HeroImage[]> {
  return getSlides("hero");
}

/** Portrait images that rotate beside the Concept / Purpose copy. */
export function getMissionSlides(): Promise<HeroImage[]> {
  return getSlides("mission");
}
