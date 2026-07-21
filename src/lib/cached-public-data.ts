import { unstable_cache } from "next/cache";

import { getTickerScrollDurationSec, getTickerScrollSpeed } from "@/lib/ticker-settings";
import { getPublicTickerItems } from "@/lib/ticker-data";
import type { PublicTickerItem, TickerVisibilityContext } from "@/lib/ticker";
import type { Locale } from "@/lib/i18n/config";
import {
  applyTranslations,
  getTranslations,
} from "@/lib/i18n/content-translations";

const TICKER_REVALIDATE_SEC = 30;

export function getCachedPublicTickerItems(context: TickerVisibilityContext) {
  return unstable_cache(
    () => getPublicTickerItems(context),
    ["public-ticker", context],
    { revalidate: TICKER_REVALIDATE_SEC }
  )();
}

/**
 * Cached English ticker items with the admin-supplied translation substituted
 * for `locale`. The translation lookup runs OUTSIDE the unstable_cache above
 * (which is keyed per-context, not per-locale) so every language gets its own
 * text; a message with no translation falls back to English.
 */
export async function getLocalizedPublicTickerItems(
  context: TickerVisibilityContext,
  locale: Locale
): Promise<PublicTickerItem[]> {
  const items = await getCachedPublicTickerItems(context);
  if (locale === "en" || items.length === 0) return items;
  const translations = await getTranslations(
    "TickerAnnouncement",
    items.map((item) => item.id),
    locale
  ).catch(() => new Map());
  return items.map((item) => applyTranslations(item, translations.get(item.id)));
}

export const getCachedTickerScrollDurationSec = unstable_cache(
  () => getTickerScrollDurationSec(),
  ["ticker-scroll-duration"],
  { revalidate: TICKER_REVALIDATE_SEC }
);

export const getCachedTickerScrollSpeed = unstable_cache(
  () => getTickerScrollSpeed(),
  ["ticker-scroll-speed"],
  { revalidate: TICKER_REVALIDATE_SEC }
);
