"use client";

import { useEffect, type RefObject } from "react";

/** Matches the `1024px` breakpoint at which the nav stops being a hamburger
 *  panel and becomes an inline link row. */
const DESKTOP_NAV_QUERY = "(min-width: 1024px)";

/** Keeps --site-header-height in sync with the measured fixed chrome (ticker + nav).
 *
 *  Pass `hidden` for routes that render no chrome at all (the portal shell, the
 *  tour index): the variable is pinned to 0 so page banners stop reserving room
 *  for a header that isn't there, instead of falling back to the CSS default.
 *
 *  The measurement deliberately ignores the OPEN mobile hamburger panel. That
 *  panel expands in flow to most of the viewport, and pages offset themselves
 *  by this variable — so tracking it would shove the page content down the
 *  moment the menu button is tapped, and snap it back on close. The collapsed
 *  bar height is what content has to clear, so that is what we keep. */
export function useSiteHeaderHeight(
  chromeRef: RefObject<HTMLElement | null>,
  hidden = false
) {
  useEffect(() => {
    const root = document.documentElement;

    if (hidden) {
      root.style.setProperty("--site-header-height", "0px");
      return () => root.style.removeProperty("--site-header-height");
    }

    const el = chromeRef.current;
    if (!el) return;

    const mobilePanelOpen = () =>
      !window.matchMedia(DESKTOP_NAV_QUERY).matches &&
      Boolean(el.querySelector(".pats-header--menu-open"));

    const apply = () => {
      if (mobilePanelOpen()) return;
      root.style.setProperty("--site-header-height", `${el.offsetHeight}px`);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    // The panel opening/closing is a class change, not always a resize of the
    // observed box, so watch for it too and re-measure once it has collapsed.
    const mutations = new MutationObserver(apply);
    mutations.observe(el, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
    });
    window.addEventListener("resize", apply, { passive: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", apply);
      root.style.removeProperty("--site-header-height");
    };
  }, [chromeRef, hidden]);
}
