import { ArmyNavbar } from "@/components/army/ArmyNavbar";
import { CinematicNav } from "@/components/cinematic/CinematicNav";
import {
  getCachedTickerScrollDurationSec,
  getLocalizedPublicTickerItems,
} from "@/lib/cached-public-data";
import { getLocale } from "@/lib/i18n/get-dictionary";
import { getRequestPathname } from "@/lib/request-pathname";

export async function ArmyNavAsync({ dayTheme = false }: { dayTheme?: boolean }) {
  const pathname = await getRequestPathname();
  if (dayTheme) {
    const [tickerItems, tickerScrollDurationSec] = await Promise.all([
      getLocale().then((locale) => getLocalizedPublicTickerItems(locale)),
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
