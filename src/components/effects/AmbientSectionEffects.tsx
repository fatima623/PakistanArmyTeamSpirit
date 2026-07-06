"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SITE_THEME_CHANGE_EVENT } from "@/lib/site-theme";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const HOVER_LIFT_SELECTOR = [
  ".pats-image-card",
  ".pats-video-card",
  ".pats-highlight-cell",
  ".pats-doc-card",
  ".pats-prose-panel",
  ".tac-mission-card",
  ".cp-form-card",
  ".portal-card",
  ".portal-card-accent-amber",
  ".portal-card-accent-sky",
  ".portal-form-card",
  ".portal-stat-card",
  ".admin-command-banner",
  ".admin-users-card",
  ".admin-stat-card",
  ".paf-card",
  ".paf-value-card",
  ".tac-nation-chip",
].join(", ");

export function AmbientSectionEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let teardown = () => {};
    let rafId = 0;

    const runSetup = () => {
      rafId = window.requestAnimationFrame(() => {
        gsap.registerPlugin(ScrollTrigger);

        const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

        const parallaxContext = gsap.context(() => {
          if (prefersReducedMotion) return;

          gsap.utils
            .toArray<HTMLElement>(".parallax-section:not(.hero)")
            .forEach((section) => {
              if (section.closest(".hero, #hero, .pats-hero, .pats-page-hero")) {
                return;
              }

              /* Participation band — keep photo backdrop inside section (no bleed below) */
              if (section.id === "careers") return;

              const background = section.querySelector<HTMLElement>(".parallax-bg");
              if (!background) return;

              section.classList.add("parallax-active");

              const isPinnedWatermark = section.classList.contains(
                "parallax-section--watermark"
              );

              if (isPinnedWatermark) {
                /* Logo stays fixed in the viewport while this section is on screen */
                ScrollTrigger.create({
                  trigger: section,
                  start: "top bottom",
                  end: "bottom top",
                  pin: background,
                  pinSpacing: false,
                  pinReparent: true,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                });
                return;
              }

              gsap.set(background, {
                willChange: "transform",
                force3D: true,
                z: 0,
              });

              gsap.fromTo(
                background,
                { yPercent: 0 },
                {
                  yPercent: -20,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                }
              );
            });
        }, document.body);

        const hoverLiftNodes = Array.from(
          document.querySelectorAll<HTMLElement>(HOVER_LIFT_SELECTOR)
        );

        hoverLiftNodes.forEach((card) => {
          if (card.closest(".hero, #hero, .pats-hero, .pats-page-hero")) {
            return;
          }

          /* Auth pages — panels stay static (no lift on hover) */
          if (
            card.closest(".pats-auth-shell, .pats-form-page") ||
            card.classList.contains("pats-login-card")
          ) {
            return;
          }

          card.classList.add("hover-lift-card");
        });

        ScrollTrigger.refresh();

        teardown = () => {
          hoverLiftNodes.forEach((node) => node.classList.remove("hover-lift-card"));
          document
            .querySelectorAll<HTMLElement>(".parallax-section.parallax-active")
            .forEach((section) => section.classList.remove("parallax-active"));
          parallaxContext.revert();
        };
      });
    };

    /*
     * Defer setup until the browser is idle — i.e. after React has finished
     * hydrating. These effects add enhancement classes (`hover-lift-card`,
     * `parallax-active`) to `.admin-stat-card` / `.portal-card` / etc. Running
     * them at the root during progressive hydration meant those classes landed
     * on nodes React had not yet hydrated, producing benign-but-noisy hydration
     * mismatches. They carry no first-paint state (hover / scroll only), so this
     * deferral is visually invisible.
     */
    let cancelDefer = () => {};
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(runSetup, { timeout: 800 });
      cancelDefer = () => window.cancelIdleCallback?.(idleId);
    } else {
      const timeoutId = window.setTimeout(runSetup, 200);
      cancelDefer = () => window.clearTimeout(timeoutId);
    }

    const onThemeChange = () => {
      window.requestAnimationFrame(() => {
        try {
          ScrollTrigger.refresh();
        } catch {
          /* layout still updating after theme switch */
        }
      });
    };

    window.addEventListener(SITE_THEME_CHANGE_EVENT, onThemeChange);

    return () => {
      cancelDefer();
      window.removeEventListener(SITE_THEME_CHANGE_EVENT, onThemeChange);
      window.cancelAnimationFrame(rafId);
      teardown();
    };
  }, [pathname]);

  return null;
}
