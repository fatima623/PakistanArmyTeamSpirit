"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

import {
  HERO_PARALLAX_SCROLL,
  HERO_VIDEO_POSTER,
  HERO_VIDEO_SRC,
} from "@/lib/cinematic-constants";
import { cn } from "@/lib/utils";

type Props = {
  /** full = 100svh homepage; compact = inner page hero */
  variant?: "full" | "compact";
  className?: string;
  parallaxStrength?: number;
};

/**
 * Shared hero video + scroll parallax. Used on homepage and every public page hero.
 */
export function VideoParallaxBackdrop({
  variant = "full",
  className,
  parallaxStrength = 1,
}: Props) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const travel = HERO_PARALLAX_SCROLL * parallaxStrength;
  const yVideo = useTransform(scrollY, [0, 700], [0, reduce ? 0 : travel]);
  const overlayFade = useTransform(scrollY, [0, 500], [1, reduce ? 1 : 0.75]);

  const isCompact = variant === "compact";

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    const play = () => {
      void el.play().catch(() => {
        /* autoplay blocked — poster remains visible */
      });
    };
    play();
    el.addEventListener("loadeddata", play);
    return () => el.removeEventListener("loadeddata", play);
  }, []);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-brand-night",
        variant === "full"
          ? "min-h-[100svh]"
          : "min-h-[clamp(15rem,30vh,20rem)]",
        className
      )}
      data-cinematic-video-backdrop
    >
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_VIDEO_POSTER})` }}
        aria-hidden
      />

      <motion.div
        style={{ y: yVideo }}
        className="absolute inset-0 z-[1] will-change-transform"
        aria-hidden
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-[110%] w-full scale-105 object-cover"
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          controls={false}
          preload="auto"
          poster={HERO_VIDEO_POSTER}
          aria-hidden
          tabIndex={-1}
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
      </motion.div>

      {/* Homepage: minimal overlay so video stays visible; inner pages get slightly more shade */}
      {!isCompact ? (
        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-cinematic-hero-bottom opacity-80"
          aria-hidden
        />
      ) : (
        <motion.div
          style={{ opacity: overlayFade }}
          className="pointer-events-none absolute inset-0 z-[2]"
          aria-hidden
        >
          <div className="absolute inset-0 bg-cinematic-hero-ltr opacity-90" />
          <div className="absolute inset-0 bg-cinematic-hero-bottom" />
          <div className="absolute inset-0 bg-brand-vignette opacity-25" />
        </motion.div>
      )}

      <div className="cinematic-noise pointer-events-none absolute inset-0 z-[3] opacity-[0.05]" />
    </div>
  );
}
