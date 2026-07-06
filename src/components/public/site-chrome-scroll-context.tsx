"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  useHomeChromeScroll,
  type HomeChromeScrollState,
} from "@/hooks/use-home-chrome-scroll";

const SiteChromeScrollContext = createContext<HomeChromeScrollState | null>(
  null
);

export function SiteChromeScrollProvider({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const state = useHomeChromeScroll(enabled);
  const value = useMemo(() => state, [state]);

  return (
    <SiteChromeScrollContext.Provider value={value}>
      {children}
    </SiteChromeScrollContext.Provider>
  );
}

export function useSiteChromeScroll(): HomeChromeScrollState {
  const ctx = useContext(SiteChromeScrollContext);
  if (!ctx) {
    return { scrolled: false, pastHero: false };
  }
  return ctx;
}
