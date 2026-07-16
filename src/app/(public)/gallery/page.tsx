import type { Metadata } from "next";

import { GalleryGrid, type GalleryItem } from "@/components/gallery/GalleryGrid";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PATS_CROP } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { GALLERY_ALBUMS } from "@/lib/pats-content";

export const metadata: Metadata = {
  title: "Gallery",
};

async function getGalleryItems(): Promise<GalleryItem[]> {
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
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        year: r.year,
        caption: r.caption,
        category: r.category,
        image: `/uploads/${r.imagePath}`,
      }));
    }
  } catch {
    // DB not migrated yet / unavailable — fall through to the static archive.
  }

  // Fallback so the public page is never empty before images are curated.
  return GALLERY_ALBUMS.map((a) => ({
    id: a.id,
    title: a.title,
    year: a.year,
    image: a.image,
    category: a.category,
  }));
}

export default async function GalleryPage() {
  const [items, { t }] = await Promise.all([getGalleryItems(), getDictionary()]);
  const g = t.publicSite.gallery;

  return (
    <div className="pats-gallery-page">
      <section className="pats-gallery-panel">
        <div
          className="pats-gallery-panel__watermark"
          style={{ backgroundImage: `url(${PATS_CROP.pageHeroInner38})` }}
          aria-hidden
        />
        <div className="pats-gallery-panel__inner">
          <header className="pats-gallery-panel__header">
            <h1 className="pats-gallery-panel__title">{g.title}</h1>
            <p className="pats-gallery-panel__subtitle">{g.subtitle}</p>
            <span className="pats-gallery-panel__rule" aria-hidden />
          </header>
          <div className="mt-8">
            <GalleryGrid items={items} />
          </div>
        </div>
      </section>
    </div>
  );
}
