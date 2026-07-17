import type { Metadata } from "next";

import { GalleryGrid, type GalleryItem } from "@/components/gallery/GalleryGrid";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import {
  applyTranslations,
  getTranslations,
} from "@/lib/i18n/content-translations";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { prisma } from "@/lib/prisma";
import { GALLERY_ALBUMS } from "@/lib/pats-content";

export const metadata: Metadata = {
  title: "Gallery",
};

async function getGalleryItems(locale: Locale): Promise<GalleryItem[]> {
  try {
    const rows = await prisma.galleryImage.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        year: true,
        caption: true,
        category: true,
        imagePath: true,
      },
    });

    if (rows.length > 0) {
      const items = rows.map((r) => ({
        id: r.id,
        title: r.title,
        year: r.year,
        caption: r.caption,
        category: r.category,
        image: `/uploads/${r.imagePath}`,
      }));

      // One batched query for the page. Only title/caption are substituted:
      // GalleryGrid groups albums by the RAW `category` and filters on `year`,
      // so translating either would fragment the albums per locale. The category
      // is localized for display inside the grid by gallery-category-i18n.
      const translations = await getTranslations(
        "GalleryImage",
        items.map((i) => i.id),
        locale
      );
      return items.map((i) => applyTranslations(i, translations.get(i.id)));
    }
  } catch {
    // DB not migrated yet / unavailable — fall through to the static archive.
  }

  // Fallback so the public page is never empty before images are curated. These
  // are static rows with no DB id, so there is nothing to look up: their copy is
  // build-time content, not admin-entered.
  return GALLERY_ALBUMS.map((a) => ({
    id: a.id,
    title: a.title,
    year: a.year,
    image: a.image,
    category: a.category,
  }));
}

export default async function GalleryPage() {
  const { t, locale } = await getDictionary();
  const items = await getGalleryItems(locale);
  const g = t.publicSite.gallery;

  // `photos` is a function and cannot cross the server/client boundary, so the
  // meta strip is resolved to plain strings here rather than inside the grid.
  const yearCount = new Set(
    items.map((i) => i.year).filter((y): y is number => typeof y === "number")
  ).size;

  return (
    <>
      <PatsPageHero
        eyebrow={g.eyebrow}
        title={g.title}
        subtitle={g.subtitle}
        meta={
          items.length > 0
            ? [
                { label: g.metaPhotosLabel, value: g.photos(items.length) },
                // Undated archives would otherwise read "Years covered — 0".
                ...(yearCount > 0
                  ? [{ label: g.metaYearsLabel, value: String(yearCount) }]
                  : []),
              ]
            : []
        }
      />
      <PatsSection variant="navy">
        <GalleryGrid items={items} />
      </PatsSection>
    </>
  );
}
