"use client";

import type { ReactNode } from "react";

import type { SectionParallaxSpeed } from "@/lib/cinematic-constants";
import { cn } from "@/lib/utils";

import { PatsSectionBackdrop } from "./PatsSectionBackdrop";

type Variant = "deepest" | "dark" | "navy" | "elevated" | "stats" | "mission" | "light";

type Props = {
  id?: string;
  variant?: Variant;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  backgroundImage?: string;
  /** contain = show full image (photo 28 three logos); cover = fill section */
  backgroundFit?: "cover" | "contain";
  /** Footer-style faded logo watermark (uses background + low opacity, not full-bleed img) */
  watermark?: boolean;
  parallax?: boolean;
  parallaxSpeed?: SectionParallaxSpeed;
};

export function PatsSection({
  id,
  variant = "dark",
  className,
  innerClassName,
  children,
  backgroundImage,
  backgroundFit = "cover",
  watermark = false,
}: Props) {
  const hasBg = Boolean(backgroundImage);

  return (
    <section
      id={id}
      className={cn(
        "pats-section",
        `pats-section--${variant}`,
        hasBg && "pats-section--has-bg",
        hasBg && "parallax-section",
        hasBg && watermark && "parallax-section--watermark",
        className
      )}
    >
      {backgroundImage && (
        <PatsSectionBackdrop
          src={backgroundImage}
          variant={variant}
          imageFit={backgroundFit}
          watermark={watermark}
        />
      )}
      <div className={cn("pats-section__inner", innerClassName)}>{children}</div>
    </section>
  );
}
