import type { ReactNode } from "react";

import { ArmyFooter } from "@/components/army/ArmyFooter";
import { ArmyNavbar } from "@/components/army/ArmyNavbar";
import {
  AnnouncementTicker,
  type MarqueeItem,
} from "@/components/cinematic/AnnouncementTicker";
import { getLocalizedPublicTickerItems } from "@/lib/cached-public-data";
import { getLocale } from "@/lib/i18n/get-dictionary";
import { getRequestPathname } from "@/lib/request-pathname";
import {
  resolveTickerVisibilityContext,
  TICKER_SCROLL_DURATION_SEC,
} from "@/lib/ticker";

export type PublicChrome = {
  nav: ReactNode;
  footer: ReactNode;
  siteTicker: ReactNode | null;
};

/**
 * Load nav, footer, and the top marquee together.
 *
 * The marquee is driven by the admin **Ticker Messages** system (not the
 * Announcements/News feed, which lives on the participant dashboard), localized
 * per language — the translation is applied outside the per-context ticker
 * cache so each locale gets its own text, falling back to English.
 */
export async function loadPublicChrome(): Promise<PublicChrome> {
  const [pathname, locale] = await Promise.all([
    getRequestPathname(),
    getLocale(),
  ]);

  const context = resolveTickerVisibilityContext(pathname, false);
  const tickerItems = await getLocalizedPublicTickerItems(context, locale).catch(
    () => []
  );

  const marqueeItems: MarqueeItem[] = tickerItems.map((item) => ({
    id: item.id,
    message: item.message,
    priority: item.priority,
    isUrgent: item.isUrgent,
  }));

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
