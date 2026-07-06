"use client";

import { cn } from "@/lib/utils";

type SectionVariant =
  | "deepest"
  | "dark"
  | "navy"
  | "elevated"
  | "stats"
  | "mission"
  | "light";

type Props = {
  src: string;
  variant: SectionVariant;
  imageFit?: "cover" | "contain";
  /** Faded center watermark like footer `paf-footer__photo` */
  watermark?: boolean;
};

export function PatsSectionBackdrop({
  src,
  variant,
  imageFit = "cover",
  watermark = false,
}: Props) {
  return (
    <div className="pats-section__backdrop" aria-hidden>
      <div
        className={cn(
          "pats-section__backdrop-layer parallax-bg",
          watermark && "pats-section__backdrop-layer--logo-watermark pats-logo-watermark-bg",
          !watermark && imageFit === "contain" && "pats-section__backdrop-layer--contain"
        )}
        style={watermark ? { backgroundImage: `url(${src})` } : undefined}
      >
        {!watermark && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt=""
            className={cn(
              "pats-section__backdrop-image",
              imageFit === "contain" && "pats-section__backdrop-image--contain"
            )}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        )}
      </div>
      <div
        className={cn(
          "pats-section__backdrop-shade",
          `pats-section__backdrop-shade--${variant}`
        )}
      />
    </div>
  );
}
