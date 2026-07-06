import { AnnouncementTicker } from "@/components/cinematic/AnnouncementTicker";
import {
  getCachedPublicTickerItems,
  getCachedTickerScrollDurationSec,
} from "@/lib/cached-public-data";
import { getRequestPathname } from "@/lib/request-pathname";
import { resolveTickerVisibilityContext } from "@/lib/ticker";

/** Homepage announcement marquee — rendered inside sticky site chrome. */
export async function ArmyHomeTickerAsync() {
  const pathname = await getRequestPathname();
  if (pathname !== "/") return null;

  const context = resolveTickerVisibilityContext(pathname, false);
  const [tickerItems, tickerScrollDurationSec] = await Promise.all([
    getCachedPublicTickerItems(context),
    getCachedTickerScrollDurationSec(),
  ]);

  if (tickerItems.length === 0) return null;

  return (
    <AnnouncementTicker
      variant="overlay"
      items={tickerItems}
      scrollDurationSec={tickerScrollDurationSec}
      className="pats-hero-ticker announcement-ticker"
    />
  );
}
