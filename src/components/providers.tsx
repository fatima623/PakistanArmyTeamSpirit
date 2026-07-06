"use client";

import { SessionProvider } from "next-auth/react";

import { AmbientSectionEffects } from "@/components/effects/AmbientSectionEffects";
import { GlobalMotionEffects } from "@/components/motion/GlobalMotionEffects";
import { PageReady } from "@/components/PageReady";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
import { NavigationProgress } from "@/components/navigation/NavigationProgress";
import { SiteThemeProvider } from "@/components/theme/SiteThemeProvider";
import type { SiteTheme } from "@/lib/site-theme";

export function Providers({
  children,
  initialSiteTheme,
}: {
  children: React.ReactNode;
  initialSiteTheme?: SiteTheme;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <SiteThemeProvider initialTheme={initialSiteTheme}>
        <PageReady />
        <ScrollToTopOnNavigate />
        <AmbientSectionEffects />
        <GlobalMotionEffects />
        <NavigationProgress />
        {children}
      </SiteThemeProvider>
    </SessionProvider>
  );
}
