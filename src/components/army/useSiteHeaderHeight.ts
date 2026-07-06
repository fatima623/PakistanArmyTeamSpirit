"use client";

import { useEffect, type RefObject } from "react";

/** Keeps --site-header-height in sync with the measured fixed chrome (ticker + nav). */
export function useSiteHeaderHeight(chromeRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = chromeRef.current;
    if (!el) return;

    const apply = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${el.offsetHeight}px`
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    window.addEventListener("resize", apply, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, [chromeRef]);
}
