import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { adminNavLabel } from "@/lib/admin-navigation";
import { HERO_ADMIN_SELECT } from "@/lib/storage/hero-slide";
import {
  HeroSlidesManager,
  type AdminHeroSlide,
} from "@/components/admin/HeroSlidesManager";

export const metadata: Metadata = {
  title: adminNavLabel("missionImages"),
};

/**
 * The Concept / Purpose portrait beside the home page mission copy. Same table
 * and same manager as the hero slider — only the `placement` filter differs.
 */
export default async function AdminMissionImagesPage() {
  let slides: AdminHeroSlide[] = [];
  try {
    slides = await prisma.heroSlide.findMany({
      where: { placement: "mission" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: HERO_ADMIN_SELECT,
    });
  } catch {
    // HeroSlide.placement not pushed yet — render an empty manager rather than
    // a 500 so the section stays reachable (mirrors /admin/hero).
    slides = [];
  }

  return <HeroSlidesManager initialSlides={slides} placement="mission" />;
}
