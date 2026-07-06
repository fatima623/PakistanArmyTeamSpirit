import type { ReactNode } from "react";



import { ArmyFooter } from "@/components/army/ArmyFooter";

import { ArmyNavbar } from "@/components/army/ArmyNavbar";

import { AnnouncementTicker } from "@/components/cinematic/AnnouncementTicker";

import {

  getCachedPublicTickerItems,

  getCachedTickerScrollDurationSec,

} from "@/lib/cached-public-data";

import { getRequestPathname } from "@/lib/request-pathname";

import { DEFAULT_SOCIAL, getPublicSocialLinks } from "@/lib/site-data";

import { resolveTickerVisibilityContext } from "@/lib/ticker";



export type PublicChrome = {

  nav: ReactNode;

  footer: ReactNode;

  siteTicker: ReactNode | null;

};



/** Load nav, footer, and site ticker together — avoids Suspense stagger. */

export async function loadPublicChrome(): Promise<PublicChrome> {

  const pathname = await getRequestPathname();

  const tickerContext = resolveTickerVisibilityContext(pathname, false);



  const [social, tickerItems, tickerScrollDurationSec] = await Promise.all([

    getPublicSocialLinks().catch(() => DEFAULT_SOCIAL),

    getCachedPublicTickerItems(tickerContext),

    getCachedTickerScrollDurationSec(),

  ]);



  const siteTicker =

    tickerItems.length > 0 ? (

      <AnnouncementTicker

        variant="overlay"

        items={tickerItems}

        scrollDurationSec={tickerScrollDurationSec}

        className="pats-hero-ticker announcement-ticker"

      />

    ) : null;



  return {

    nav: <ArmyNavbar pathname={pathname} />,

    footer: <ArmyFooter social={social} />,

    siteTicker,

  };

}

