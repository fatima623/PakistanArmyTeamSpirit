"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const HERO_IMAGES = [
  "/media/pats/crops/home2.jpeg",
  "/media/pats/crops/hero-hmz1.jpeg",
  "/media/pats/crops/home3.jpeg",
  "/media/pats/crops/hero-hmz2.jpeg",
  "/media/pats/crops/home5.jpeg",
];

type Props = {
  exerciseYear: number;
};

export function PatsHero({ exerciseYear }: Props) {
  const { t, locale, dir } = useI18n();
  // English keeps the crest's heraldic Urdu form (nastaliq, RTL). Every other
  // locale renders a real translation of the motto's meaning, in that locale's
  // own script and direction — the nastaliq face cannot render Cyrillic, Latin
  // or CJK, so `.pats-urdu-motto` must not be applied there.
  const isUrduCrest = locale === "en";
  const sectionRef = useRef<HTMLElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [dynamicYear, setDynamicYear] = useState(exerciseYear);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    // getMonth() is 0-indexed, so 6 is July
    const computedYear = now.getMonth() >= 6 ? currentYear + 1 : currentYear;
    setDynamicYear(computedYear);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      setShowScrollHint(rect.bottom > window.innerHeight * 0.12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="pats-hero"
      aria-label={t.home.hero.featuredAria}
    >
      {HERO_IMAGES.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className="pats-hero__video"
          style={{
            transition: "opacity 1s ease-in-out",
            opacity: index === currentImageIndex ? 1 : 0,
          }}
          aria-hidden
        />
      ))}

      <div className="pats-hero__overlay-base" aria-hidden />
      <div className="pats-hero__overlay-vignette" aria-hidden />

      <div className="pats-hero__footer">
        <div className="pats-hero__content">
          <div className="pats-hero__caption">
            <p
              className={cn(
                "pats-hero__caption-text",
                isUrduCrest && "pats-urdu-motto"
              )}
              lang={isUrduCrest ? "ur" : locale}
              dir={isUrduCrest ? "rtl" : dir}
            >
              {t.home.hero.motto}
            </p>
          </div>
          <h1 className="pats-hero__headline">
            <span className="pats-hero__headline-line">
              {t.home.hero.titleLine1}
            </span>
            <span className="pats-hero__headline-line">
              {t.home.hero.titleLine2}
            </span>
            <span className="pats-hero__headline-accent">{dynamicYear}</span>
          </h1>
          <p className="pats-hero__subline">{t.home.hero.description}</p>
        </div>

        <Link
          href="/event/register"
          className="pats-hero__cta hero-register-btn"
          prefetch
        >
          {t.home.hero.cta}
        </Link>
      </div>

      <a
        href="#mission"
        className={cn(
          "pats-hero__scroll-hint",
          !showScrollHint && "pats-hero__scroll-hint--hidden"
        )}
        aria-label={t.home.hero.scrollHint}
        aria-hidden={!showScrollHint}
        tabIndex={showScrollHint ? 0 : -1}
      >
        <ChevronDown className="pats-hero__scroll-hint-icon" strokeWidth={1.5} aria-hidden />
      </a>
    </section>
  );
}
