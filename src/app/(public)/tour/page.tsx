import type { Metadata } from "next";

import { HomeArmy } from "@/components/army/HomeArmy";
import { getHeroSlides, getMissionSlides } from "@/lib/hero-slides";
import { getKeyDates, getSiteSettings } from "@/lib/site-data";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { requireTourAccess } from "@/lib/require-tour";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.home };
}

/**
 * The tour home — the former public landing page, moved behind the login.
 *
 * `/` is now a bare sign-in screen that shows nothing about the exercise, so
 * the marketing home (hero, mission showcase, key dates) lives here instead,
 * with the tour navbar carrying the rest of the sections. It renders exactly
 * what `/` used to render; only the route and the access gate changed.
 */
export default async function TourPage() {
  await requireTourAccess();

  const [settings, keyDates, heroSlides, missionSlides] = await Promise.all([
    getSiteSettings(),
    getKeyDates(),
    getHeroSlides(),
    getMissionSlides(),
  ]);

  return (
    <HomeArmy
      settings={settings}
      heroSlides={heroSlides}
      missionSlides={missionSlides}
      keyDates={keyDates.map((k) => ({
        id: k.id,
        label: k.label,
        value: k.value,
      }))}
    />
  );
}
