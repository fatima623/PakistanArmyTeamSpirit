import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { GalleryGrid, type GalleryItem } from "@/components/gallery/GalleryGrid";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
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
    category: "Field archive",
  }));
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <PatsSection variant="deepest">
      <ScrollReveal>
        <PatsSectionHeading
          eyebrow="Field archive"
          title="Competition gallery"
          description="Documentary archive of international PATS editions — delegations, ceremonies, and operational heritage."
        />
      </ScrollReveal>
      <ScrollReveal className="mt-10">
        <GalleryGrid items={items} />
      </ScrollReveal>
    </PatsSection>
  );
}
