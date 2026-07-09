import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { adminNavLabel } from "@/lib/admin-navigation";
import { GALLERY_ADMIN_SELECT } from "@/lib/storage/gallery-image";
import {
  GalleryManager,
  type AdminGalleryImage,
} from "@/components/admin/GalleryManager";

export const metadata: Metadata = {
  title: adminNavLabel("gallery"),
};

export default async function AdminGalleryPage() {
  let images: AdminGalleryImage[] = [];
  try {
    images = await prisma.galleryImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: GALLERY_ADMIN_SELECT,
    });
  } catch {
    // GalleryImage migration not applied yet — render an empty manager rather
    // than a 500 so the section stays reachable (mirrors the public page).
    images = [];
  }

  return <GalleryManager initialImages={images} />;
}
