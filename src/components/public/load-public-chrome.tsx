import type { ReactNode } from "react";

import { ArmyFooter } from "@/components/army/ArmyFooter";
import { ArmyNavbar } from "@/components/army/ArmyNavbar";
import {
  AnnouncementTicker,
  type MarqueeItem,
} from "@/components/cinematic/AnnouncementTicker";
import {
  applyTranslations,
  getTranslations,
} from "@/lib/i18n/content-translations";
import { getLocale } from "@/lib/i18n/get-dictionary";
import { getRequestPathname } from "@/lib/request-pathname";
import { getAnnouncements } from "@/lib/site-data";
import { TICKER_SCROLL_DURATION_SEC } from "@/lib/ticker";

/** Newest announcements shown in the marquee (the page itself lists all). */
const MARQUEE_ANNOUNCEMENT_LIMIT = 10;

export type PublicChrome = {
  nav: ReactNode;
  footer: ReactNode;
  siteTicker: ReactNode | null;
};

/**
 * Load nav, footer, and the top marquee together.
 *
 * The marquee mirrors the public **Announcements** page (NewsPost): the same
 * admin-entered announcements scroll here, each linking to the announcements
 * list page. Posts past their expiry date drop out of the marquee but stay
 * listed on /announcements as an archive. The admin **Ticker Messages**
 * system feeds the participant dashboard's Latest Updates card instead.
 */
export async function loadPublicChrome(): Promise<PublicChrome> {
  const [pathname, locale] = await Promise.all([
    getRequestPathname(),
    getLocale(),
  ]);

  const now = Date.now();
  const posts = await getAnnouncements().catch(() => []);
  const current = posts
    .filter((p) => !p.expiresAt || new Date(p.expiresAt).getTime() > now)
    .slice(0, MARQUEE_ANNOUNCEMENT_LIMIT);

  // Titles are stored in English; substitute the admin-authored translation
  // for the active locale, falling back to English — the same lookup the
  // /announcements page performs (the cached fetch is not keyed per-locale).
  const translations =
    locale === "en" || current.length === 0
      ? null
      : await getTranslations(
          "NewsPost",
          current.map((p) => p.id),
          locale
        ).catch(() => null);

  const marqueeItems: MarqueeItem[] = current.map((post) => {
    const localized = translations
      ? applyTranslations(post, translations.get(post.id))
      : post;
    return {
      id: post.id,
      message: localized.title,
      href: "/announcements",
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
