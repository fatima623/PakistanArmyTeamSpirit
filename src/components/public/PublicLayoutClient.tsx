"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { usePathname } from "next/navigation";

import { useSiteHeaderHeight } from "@/components/army/useSiteHeaderHeight";
import { SiteChromeScrollProvider } from "@/components/public/site-chrome-scroll-context";
import { useSiteChromeScroll } from "@/components/public/site-chrome-scroll-context";
import { CinematicShell } from "@/components/cinematic/CinematicShell";
import { useSiteTheme } from "@/components/theme/SiteThemeProvider";
import {
  pathnameHasPageBanner,
  pathnameIsCinematicFullWidth,
  pathnameIsParticipantPortalApp,
  pathnameUsesInnerPageShell,
} from "@/lib/public-layout";
import { cn } from "@/lib/utils";

function PublicSiteChrome({
  children,
  siteTicker,
  nav,
  footer,
}: {
  children: ReactNode;
  siteTicker?: ReactNode;
  nav: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const cinematicFullWidth = pathnameIsCinematicFullWidth(pathname);
  const innerPageShell = pathnameUsesInnerPageShell(pathname);
  const pageBanner = pathnameHasPageBanner(pathname);
  const portalApp = pathnameIsParticipantPortalApp(pathname);
  const chromeRef = useRef<HTMLDivElement>(null);
  const hasSiteTicker = Boolean(siteTicker);
  const { scrolled: chromeScrolled, pastHero } = useSiteChromeScroll();
  const chromeSolid = chromeScrolled || pastHero;
  const marqueeScrolled = hasSiteTicker && chromeSolid;

  useSiteHeaderHeight(chromeRef);

  return (
    <>
      {/* Logged-in participant portal pages render their own sidebar/header,
          so the public marketing nav + news marquee are hidden there. */}
      {portalApp ? null : (
        <div
          ref={chromeRef}
          className={cn(
            "pats-site-chrome",
            hasSiteTicker && "pats-site-chrome--has-ticker",
            chromeScrolled && "pats-site-chrome--scrolled",
            pastHero && "pats-site-chrome--past-hero",
            marqueeScrolled && "pats-site-chrome--marquee-scrolled"
          )}
        >
          {hasSiteTicker ? siteTicker : null}
          {nav}
        </div>
      )}
      <div
        className={cn(
          "pats-site-body",
          innerPageShell && "pats-site-body--inner",
          pageBanner && "pats-site-body--page-banner",
          portalApp && "pats-site-body--portal-app"
        )}
      >
        <div
          className={cn(
            "pats-site-body__main",
            innerPageShell && !portalApp && "pats-inner-page-shell",
            portalApp && "pats-site-body__main--portal-app",
            !cinematicFullWidth &&
              !portalApp &&
              "mx-auto w-full max-w-6xl px-4 pb-10 pt-4 sm:px-8 sm:pb-12 sm:pt-6 lg:px-10"
          )}
        >
          {children}
        </div>
        <div className="pats-site-footer">{footer}</div>
      </div>
    </>
  );
}

export function PublicLayoutClient({
  children,
  siteTicker,
  nav,
  footer,
}: {
  children: ReactNode;
  siteTicker?: ReactNode;
  nav: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const { dayTheme } = useSiteTheme();
  const isHome = pathname === "/";

  return (
    <CinematicShell fullBleed={isHome} dayTheme={dayTheme}>
      <SiteChromeScrollProvider enabled>
        <PublicSiteChrome siteTicker={siteTicker} nav={nav} footer={footer}>
          {children}
        </PublicSiteChrome>
      </SiteChromeScrollProvider>
    </CinematicShell>
  );
}
