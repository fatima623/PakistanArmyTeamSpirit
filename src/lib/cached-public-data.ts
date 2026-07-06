import { unstable_cache } from "next/cache";

import { getTickerScrollDurationSec, getTickerScrollSpeed } from "@/lib/ticker-settings";
import { getPublicTickerItems } from "@/lib/ticker-data";
import type { TickerVisibilityContext } from "@/lib/ticker";

const TICKER_REVALIDATE_SEC = 30;

export function getCachedPublicTickerItems(context: TickerVisibilityContext) {
  return unstable_cache(
    () => getPublicTickerItems(context),
    ["public-ticker", context],
    { revalidate: TICKER_REVALIDATE_SEC }
  )();
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
