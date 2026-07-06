"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function resetScrollPosition() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const main = document.getElementById("main-content");
  if (main) {
    main.scrollTop = 0;
  }
}

/** Scroll to top on route change only — preserve position on initial load / duplicated tab. */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resetScrollPosition();
  }, [pathname]);

  return null;
}
