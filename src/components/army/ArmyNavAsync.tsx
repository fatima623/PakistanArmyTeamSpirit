import { ArmyNavbar } from "@/components/army/ArmyNavbar";
import { CinematicNav } from "@/components/cinematic/CinematicNav";
import {
  getCachedPublicTickerItems,
  getCachedTickerScrollDurationSec,
} from "@/lib/cached-public-data";
import { getRequestPathname } from "@/lib/request-pathname";
import { resolveTickerVisibilityContext } from "@/lib/ticker";

export async function ArmyNavAsync({ dayTheme = false }: { dayTheme?: boolean }) {
  const pathname = await getRequestPathname();
  const context = resolveTickerVisibilityContext(pathname, dayTheme);
  if (dayTheme) {
    const [tickerItems, tickerScrollDurationSec] = await Promise.all([
      getCachedPublicTickerItems(context),
      getCachedTickerScrollDurationSec(),
    ]);
    return (
      <CinematicNav
        pathname={pathname}
        dayTheme
        tickerItems={tickerItems}
        tickerScrollDurationSec={tickerScrollDurationSec}
      />
    );
  }

  return <ArmyNavbar pathname={pathname} />;
}
