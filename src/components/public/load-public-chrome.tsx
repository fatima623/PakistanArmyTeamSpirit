import type { ReactNode } from "react";

import { ArmyFooter } from "@/components/army/ArmyFooter";
import { ArmyNavbar } from "@/components/army/ArmyNavbar";
import {
  AnnouncementTicker,
  type MarqueeItem,
} from "@/components/cinematic/AnnouncementTicker";
import { getRequestPathname } from "@/lib/request-pathname";
import { getLatestNews } from "@/lib/site-data";
import { TICKER_SCROLL_DURATION_SEC } from "@/lib/ticker";
import {
  applyTranslations,
  getTranslations,
} from "@/lib/i18n/content-translations";
import { getLocale } from "@/lib/i18n/get-dictionary";

export type PublicChrome = {
  nav: ReactNode;
  footer: ReactNode;
  siteTicker: ReactNode | null;
};

/** Load nav, footer, and the announcements marquee together. */
export async function loadPublicChrome(): Promise<PublicChrome> {
  const [pathname, locale, announcements] = await Promise.all([
    getRequestPathname(),
    getLocale(),
    getLatestNews(12).catch(() => []),
  ]);

  // Localize the marquee titles with admin-supplied translations, mirroring the
  // /announcements list. Done here (not inside getLatestNews' unstable_cache,
  // which is keyed per-fetch not per-locale) so each language gets its own text;
  // the `slug` stays untranslated (it is the /announcements/[slug] lookup key).
  const translations = await getTranslations(
    "NewsPost",
    announcements.map((a) => a.id),
    locale
  ).catch(() => new Map());

  const marqueeItems: MarqueeItem[] = announcements.map((a) => {
    const localized = applyTranslations(a, translations.get(a.id));
    return {
      id: a.id,
      message: localized.title,
      href: `/announcements/${a.slug}`,
    };
  });

  const siteTicker =
    marqueeItems.length > 0 ? (
      <AnnouncementTicker
        variant="overlay"
        items={marqueeItems}
        showSpeaker
        scrollDurationSec={TICKER_SCROLL_DURATION_SEC.SLOW}
        className="pats-hero-ticker announcement-ticker"
      />
    ) : null;

  return {
    nav: <ArmyNavbar pathname={pathname} />,
    footer: <ArmyFooter />,
    siteTicker,
  };
}
