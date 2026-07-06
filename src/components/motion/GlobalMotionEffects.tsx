"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { pathnameIsParticipantPortalApp } from "@/lib/participant-portal-paths";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Marketing scroll-reveal is skipped on functional app surfaces. */
function isAppSurface(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathnameIsParticipantPortalApp(pathname);
}

const ANIMATE_SELECTORS = [
  ".pats-section",
  ".pats-section-heading",
  ".pats-section-title",
  ".pats-section-title--display",
  ".pats-mission-banner",
  ".tac-mission-card",
  ".pats-highlight-cell",
  ".pats-image-card",
  ".pats-video-card",
  ".pats-rule-card",
  ".pats-doc-card",
  ".pats-panel",
  ".pats-btn",
  ".army-btn",
  ".paf-card",
  ".paf-value-card",
  ".paf-prefooter",
  ".operational-map__route",
  ".operational-map__term",
  ".pats-page-hero__content",
  ".pats-auth-shell__intro",
  ".pats-login-card",
  ".pats-form-section",
  "article.border",
  ".pats-section__inner > .grid > *",
  ".pats-section__inner > ul > li",
].join(",");

const STAGGER_PARENTS = ".pats-section__inner, .pats-highlight-grid";

function skipMotionTarget(el: HTMLElement) {
  return !!el.closest(".pats-hero, .pats-page-hero__stage, .pats-section--stats");
}

function setupScrollDeck() {
  const home = document.querySelector<HTMLElement>(".army-home.scroll-deck");
  if (!home) return;

  Array.from(
    home.querySelectorAll<HTMLElement>(":scope > *:not(.scroll-deck__hero)")
  ).forEach((layer, index) => {
    layer.classList.add("scroll-deck-layer");
    layer.style.zIndex = String(index + 1);
  });
}

function tagAnimateElements(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(ANIMATE_SELECTORS).forEach((el) => {
    if (skipMotionTarget(el)) return;
    el.classList.add("animate-on-scroll");
  });

  root.querySelectorAll<HTMLElement>(STAGGER_PARENTS).forEach((parent) => {
    if (skipMotionTarget(parent)) return;
    parent.classList.add("stagger-children", "animate-on-scroll");
    Array.from(parent.children).forEach((child) => {
      if (child instanceof HTMLElement && !skipMotionTarget(child)) {
        child.classList.add("animate-on-scroll");
      }
    });
  });
}

function bindScrollAnimations(reduced: boolean) {
  if (reduced) {
    document.querySelectorAll(".animate-on-scroll, .stagger-children").forEach((el) => {
      el.classList.add("in-view");
    });
    return () => undefined;
  }

  const seen = new WeakSet<Element>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        entry.target.classList.add("in-view");
        if (entry.target.classList.contains("stagger-children")) {
          entry.target.querySelectorAll(".animate-on-scroll").forEach((child) => {
            child.classList.add("in-view");
          });
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
  );

  document.querySelectorAll(".animate-on-scroll, .stagger-children").forEach((el) => {
    const html = el as HTMLElement;
    const rect = html.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      html.classList.add("in-view");
      seen.add(el);
      if (html.classList.contains("stagger-children")) {
        html.querySelectorAll(".animate-on-scroll").forEach((c) => c.classList.add("in-view"));
      }
    } else {
      observer.observe(el);
    }
  });

  return () => observer.disconnect();
}

export function GlobalMotionEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // The admin console and participant portal are functional app surfaces, not
    // marketing pages. Tagging their cards (.pats-panel / .portal-card / …) with
    // scroll-reveal classes after SSR raced React's progressive hydration and
    // produced hydration mismatches. Skip motion setup entirely on those routes.
    if (isAppSurface(pathname)) return;

    document.documentElement.classList.add("motion-active");

    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    let disconnectObserver: (() => void) | undefined;

    const run = () => {
      setupScrollDeck();
      tagAnimateElements(document);
      disconnectObserver?.();
      disconnectObserver = bindScrollAnimations(reduced);
    };

    const rafId = window.requestAnimationFrame(run);

    return () => {
      window.cancelAnimationFrame(rafId);
      disconnectObserver?.();
    };
  }, [pathname]);

  return null;
}
