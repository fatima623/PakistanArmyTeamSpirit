"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { MISSION_SOLDIER_PLACEHOLDER } from "@/lib/army-content";
import { HERO_MOTTO } from "@/lib/branding";
import type { HeroImage } from "@/components/hero/PatsHero";
import { PATS_CROP } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  quote: string;
  body: string;
  /**
   * Admin-published portraits for the left column. They rotate on their own —
   * there are deliberately no next/previous controls — and fall back to the
   * bundled art when nothing has been published.
   */
  images?: HeroImage[];
  /** Meaning of the Urdu crest motto, in the active locale. */
  mottoTranslation?: string;
  /** Active locale + its direction, for the translation line only. */
  mottoLang?: string;
  mottoDir?: "ltr" | "rtl";
  /** Localized alt text for the decorative badges image. */
  imageAlt?: string;
};

const REVEAL_MS = 900;
const STAGGER_MS = 150;
/** How long each Concept / Purpose portrait holds before the next one fades in. */
const ROTATE_MS = 6000;

/** Shipped art, so the column is never empty on a fresh install. */
const FALLBACK_IMAGES: HeroImage[] = [
  { src: MISSION_SOLDIER_PLACEHOLDER, alt: "" },
];

export function PatsMissionShowcase({
  eyebrow = "Concept / Purpose",
  quote,
  body,
  images,
  mottoTranslation,
  mottoLang,
  mottoDir,
  imageAlt = "PATS international competition marks",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const portraits = images && images.length > 0 ? images : FALLBACK_IMAGES;
  const [portraitIndex, setPortraitIndex] = useState(0);

  useEffect(() => {
    // Nothing to rotate to with a single image; and a picture that swaps on a
    // timer is exactly the motion `prefers-reduced-motion` asks us to drop.
    if (portraits.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      // Picked at random rather than cycled: there are no controls, so a fixed
      // order would read as a loop. Drawing from the OTHER images guarantees
      // the picture actually changes on every tick.
      setPortraitIndex((prev) => {
        const pick = Math.floor(Math.random() * (portraits.length - 1));
        return pick >= prev ? pick + 1 : pick;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [portraits.length]);

  // Guards against an index left over from a longer previous list.
  useEffect(() => {
    setPortraitIndex((prev) => (prev < portraits.length ? prev : 0));
  }, [portraits.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-mission-reveal]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const reveal = () => {
      targets.forEach((el, index) => {
        window.setTimeout(() => {
          el.classList.add("is-visible");
        }, index * STAGGER_MS);
      });
    };

    const showIfInView = () => {
      const rect = root.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
        reveal();
        return true;
      }
      return false;
    };

    if (showIfInView()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="pats-mission-showcase">
      <div className="pats-mission-showcase__watermark" aria-hidden>
        <Image
          src={PATS_CROP.logoFull}
          alt=""
          width={500}
          height={500}
          className="pats-mission-showcase__watermark-img"
          priority={false}
        />
      </div>
      <div className="pats-mission-showcase__vignette" aria-hidden />

      <div className="pats-mission-showcase__grid">
        <div
          className={cn(
            "pats-mission-showcase__col pats-mission-showcase__col--soldier",
            "pats-mission-showcase__reveal pats-mission-showcase__reveal--soldier"
          )}
          data-mission-reveal
          style={{ transitionDuration: `${REVEAL_MS}ms` }}
        >
          <div className="pats-mission-showcase__soldier-stage">
            <div className="pats-mission-showcase__soldier-frame group">
              {portraits.map((portrait, index) => (
                <Image
                  key={portrait.src}
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  sizes="(max-width: 1023px) 72vw, 28vw"
                  className="pats-mission-showcase__soldier-img"
                  style={{ opacity: index === portraitIndex ? 1 : 0 }}
                  aria-hidden={portrait.alt ? undefined : true}
                  priority={false}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "pats-mission-showcase__col pats-mission-showcase__col--content",
            "pats-mission-showcase__reveal pats-mission-showcase__reveal--content"
          )}
          data-mission-reveal
          style={{ transitionDuration: `${REVEAL_MS}ms` }}
        >
          <div className="pats-mission-showcase__content-stage">
            <div className="pats-mission">
              <p className="pats-eyebrow">{eyebrow}</p>
              <div className="pats-gold-rule pats-gold-rule--center" aria-hidden />
              <h2 className="pats-mission__quote">{quote}</h2>
              <p className="pats-body pats-body--bright pats-mission-showcase__body">
                {body}
              </p>
              {/* The crest motto is heraldry: it always stands in its
                  original Urdu between the gold rules. The translated meaning
                  follows underneath in the active locale's own script and
                  direction — nastaliq cannot render Cyrillic, Latin or CJK, so
                  `.pats-urdu-motto` never applies to that line. */}
              <div className="pats-mission-showcase__motto-row">
                <span className="pats-mission-showcase__motto-line" aria-hidden />
                <p
                  className="pats-mission__motto pats-mission-showcase__motto pats-urdu-motto"
                  lang="ur"
                  dir="rtl"
                >
                  {HERO_MOTTO}
                </p>
                <span className="pats-mission-showcase__motto-line" aria-hidden />
              </div>
              {mottoTranslation ? (
                <p
                  className="pats-mission-showcase__motto-translation"
                  lang={mottoLang}
                  dir={mottoDir}
                >
                  {mottoTranslation}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "pats-mission-showcase__col pats-mission-showcase__col--badges",
            "pats-mission-showcase__reveal pats-mission-showcase__reveal--badges"
          )}
          data-mission-reveal
          style={{ transitionDuration: `${REVEAL_MS}ms` }}
        >
          <div className="pats-mission-showcase__badges-stage">
            <div className="pats-mission-showcase__badges-float">
              <Image
                src={PATS_CROP.photo28Footer}
                alt={imageAlt}
                width={680}
                height={680}
                quality={95}
                sizes="(max-width: 1023px) 52vw, 340px"
                className="pats-mission-showcase__badges-img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
