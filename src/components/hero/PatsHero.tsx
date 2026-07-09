"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  HERO_DESCRIPTION,
  HERO_MOTTO,
  HERO_TITLE,
} from "@/lib/branding";
import { cn } from "@/lib/utils";

const HERO_IMAGES = [
  "/media/pats/crops/home2.jpeg",
  "/media/pats/crops/home3.jpeg",
  "/media/pats/crops/home4.jpeg",
  "/media/pats/crops/home5.jpeg",
];

type Props = {
  exerciseYear: number;
};

/** Display lines for long official title (PAF-style stacked headline). */
function HeroHeadlineLines({ title }: { title: string }) {
  const match = title.match(/^(.+?\(PATS\))\s*(.+)$/i);
  if (match) {
    return (
      <>
        <span className="pats-hero__headline-line">{match[1]}</span>
        <span className="pats-hero__headline-line">{match[2]}</span>
      </>
    );
  }
  return <span className="pats-hero__headline-line">{title}</span>;
}

export function PatsHero({ exerciseYear }: Props) {
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
      aria-label="Featured highlights"
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
            <p className="pats-hero__caption-text">{HERO_MOTTO}</p>
          </div>
          <h1 className="pats-hero__headline">
            <HeroHeadlineLines title={HERO_TITLE} />
            <span className="pats-hero__headline-accent">{dynamicYear}</span>
          </h1>
          <p className="pats-hero__subline">{HERO_DESCRIPTION}</p>
        </div>

        <Link
          href="/event/register"
          className="pats-hero__cta hero-register-btn"
          prefetch
        >
          Register your team
        </Link>
      </div>

      <a
        href="#mission"
        className={cn(
          "pats-hero__scroll-hint",
          !showScrollHint && "pats-hero__scroll-hint--hidden"
        )}
        aria-label="Scroll down"
        aria-hidden={!showScrollHint}
        tabIndex={showScrollHint ? 0 : -1}
      >
        <ChevronDown className="pats-hero__scroll-hint-icon" strokeWidth={1.5} aria-hidden />
      </a>
    </section>
  );
}
