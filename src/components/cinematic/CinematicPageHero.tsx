"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect } from "react";

import { mechanicalTransition } from "@/components/cinematic/motion";
import { VideoParallaxBackdrop } from "@/components/cinematic/VideoParallaxBackdrop";
import type { MetaItem } from "@/components/cinematic/HudMetaStrip";
import { HudMetaStrip } from "@/components/cinematic/HudMetaStrip";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  sectionLabel?: string;
  meta?: MetaItem[];
  className?: string;
};

/**
 * Inner-page hero — PAF-style compact banner with video parallax.
 */
export function CinematicPageHero({
  title,
  subtitle,
  sectionLabel,
  meta = [],
  className,
}: Props) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 300], [0, reduce ? 0 : 16]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY * 0.35;
      document.documentElement.style.setProperty(
        "--parallax-offset",
        `${offset}px`
      );
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "paf-page-hero relative -mx-4 mb-10 min-h-[clamp(280px,40vh,420px)] w-[calc(100%+2rem)] overflow-hidden sm:-mx-8 sm:mb-14 lg:-mx-12 lg:w-[calc(100%+6rem)]",
        className
      )}
    >
      <VideoParallaxBackdrop
        variant="compact"
        parallaxStrength={0.85}
        className="absolute inset-0 h-full min-h-full"
      />
      <div className="paf-page-hero__overlay absolute inset-0 z-[2]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[3] opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 flex h-full min-h-[clamp(280px,40vh,420px)] flex-col items-center justify-center px-4 text-center sm:px-8"
      >
        {sectionLabel && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body text-[11px] uppercase tracking-[0.22em] text-white/50"
          >
            {sectionLabel}
          </motion.p>
        )}
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...mechanicalTransition, delay: 0.08 }}
          className="font-display mt-3 text-4xl font-bold uppercase tracking-[0.06em] text-white md:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="paf-body mx-auto mt-4 max-w-2xl text-base md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <span className="font-body text-[12px] uppercase tracking-[0.1em] text-white/50 transition-colors hover:text-white">
            Home
          </span>
          <span className="text-xs text-white/30">/</span>
          <span className="font-body text-[12px] uppercase tracking-[0.1em] text-white/80">
            {title}
          </span>
        </div>
        {meta.length > 0 && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 border-t border-white/10 pt-4"
          >
            <HudMetaStrip items={meta} />
          </motion.div>
        )}
      </motion.div>
    </header>
  );
}
