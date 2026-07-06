"use client";

import { useEffect, useState } from "react";

export type HomeChromeScrollState = {
  /** Past the 80px threshold — matches navbar solid/compact (same timing) */
  scrolled: boolean;
  /** Homepage hero section no longer in view */
  pastHero: boolean;
};

export const HOME_CHROME_SCROLL_THRESHOLD_PX = 80;

function measurePastHero(): boolean {
  const deckHero = document.querySelector(
    ".army-home.scroll-deck .scroll-deck__hero"
  );
  if (deckHero) {
    return deckHero.getBoundingClientRect().bottom <= 24;
  }

  const firstLayer = document.querySelector(
    ".army-home.scroll-deck .scroll-deck-layer--first"
  );
  if (firstLayer) {
    return firstLayer.getBoundingClientRect().top <= 24;
  }

  const fullscreenHero = document.querySelector(
    ".army-home .pats-hero, .pats-hero"
  );
  if (fullscreenHero) {
    return fullscreenHero.getBoundingClientRect().bottom <= 24;
  }

  const pageBanner = document.querySelector(
    ".pats-page-hero--banner, .pats-page-hero__stage"
  );
  if (pageBanner) {
    return pageBanner.getBoundingClientRect().bottom <= 24;
  }

  /* No hero band — use scrolled chrome immediately (portal, plain inner pages). */
  return true;
}

function readChromeScrollState(): HomeChromeScrollState {
  if (typeof window === "undefined") {
    return { scrolled: false, pastHero: false };
  }
  return {
    scrolled: window.scrollY > HOME_CHROME_SCROLL_THRESHOLD_PX,
    pastHero: measurePastHero(),
  };
}

export function useHomeChromeScroll(enabled: boolean): HomeChromeScrollState {
  const [state, setState] = useState<HomeChromeScrollState>(readChromeScrollState);

  useEffect(() => {
    if (!enabled) {
      setState({ scrolled: false, pastHero: false });
      return;
    }

    const update = () => setState(readChromeScrollState());

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled]);

  return state;
}
