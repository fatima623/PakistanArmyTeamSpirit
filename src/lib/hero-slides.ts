import type { HeroImage } from "@/components/hero/PatsHero";
import { prisma } from "@/lib/prisma";

/**
 * Published hero slides in display order.
 *
 * Returns an empty array (rather than throwing) when the `HeroSlide` table has
 * not been migrated yet — `PatsHero` then falls back to its bundled art, so the
 * home page never loses its hero because of a pending migration.
 */
export async function getHeroSlides(): Promise<HeroImage[]> {
  try {
    const rows = await prisma.heroSlide.findMany({
      where: { published: true },
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
