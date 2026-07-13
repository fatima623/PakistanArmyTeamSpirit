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

export type PublicChrome = {
  nav: ReactNode;
  footer: ReactNode;
  siteTicker: ReactNode | null;
};

/** Load nav, footer, and the announcements marquee together. */
export async function loadPublicChrome(): Promise<PublicChrome> {
  const pathname = await getRequestPathname();

  const announcements = await getLatestNews(12).catch(() => []);

  const marqueeItems: MarqueeItem[] = announcements.map((a) => ({
    id: a.id,
    message: a.title,
    href: `/announcements/${a.slug}`,
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
