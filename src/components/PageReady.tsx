"use client";

import { useEffect } from "react";

const FAILSAFE_MS = 4000;

function markPageReady() {
  const root = document.documentElement;
  root.classList.add("reveal-active", "motion-active");

  document.querySelectorAll(".reveal, .animate-on-scroll").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      el.classList.add("visible", "in-view");
    }
  });

  root.classList.remove("page-loading");
  root.classList.add("page-ready");
}

/**
 * Reveals the full page in one step after fonts and first paint are ready.
 * Paired with an inline script that sets `page-loading` before React hydrates.
 */
export function PageReady() {
  useEffect(() => {
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(markPageReady);
      });
    };

    const failsafe = window.setTimeout(finish, FAILSAFE_MS);

    const whenReady = async () => {
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        /* ignore */
      }
      finish();
    };

    if (document.readyState === "complete") {
      void whenReady();
    } else {
      window.addEventListener("load", () => void whenReady(), { once: true });
    }

    return () => {
      window.clearTimeout(failsafe);
    };
  }, []);

  return null;
}
