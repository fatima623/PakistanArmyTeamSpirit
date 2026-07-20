import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { adminNavLabel } from "@/lib/admin-navigation";
import { HERO_ADMIN_SELECT } from "@/lib/storage/hero-slide";
import {
  HeroSlidesManager,
  type AdminHeroSlide,
} from "@/components/admin/HeroSlidesManager";

export const metadata: Metadata = {
  title: adminNavLabel("hero"),
};

export default async function AdminHeroPage() {
  let slides: AdminHeroSlide[] = [];
  try {
    slides = await prisma.heroSlide.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: HERO_ADMIN_SELECT,
    });
  } catch {
    // HeroSlide migration not applied yet — render an empty manager rather than
    // a 500 so the section stays reachable (mirrors the gallery page).
    slides = [];
  }

  return <HeroSlidesManager initialSlides={slides} />;
}
