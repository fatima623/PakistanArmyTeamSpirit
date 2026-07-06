import Image from "next/image";

import { PATS_LOGO } from "@/lib/branding";
import { cn } from "@/lib/utils";

type Props = {
  /** Display size in pixels (square) when not sized via CSS class. */
  size?: number;
  className?: string;
  priority?: boolean;
  /** Navbar / compact mark — square crop */
  variant?: "full" | "nav";
  style?: React.CSSProperties;
};

const NAV_LOGO_MAX = 682;

/** Intrinsic px for next/image — 2× display size so retina stays sharp. */
function logoSrcSize(displayPx: number) {
  return Math.min(NAV_LOGO_MAX, Math.max(displayPx, Math.round(displayPx * 2)));
}

export function PatsLogo({
  size = 48,
  className,
  priority = false,
  variant = "nav",
  style,
}: Props) {
  const src = variant === "nav" ? PATS_LOGO.navSrc : PATS_LOGO.src;
  const cssSized =
    className?.includes("pats-nav__emblem") ||
    className?.includes("paf-footer__logo");
  const srcSize =
    variant === "nav"
      ? logoSrcSize(size)
      : Math.min(PATS_LOGO.width, Math.round(size * 2));

  return (
    <Image
      src={src}
      alt={PATS_LOGO.alt}
      width={srcSize}
      height={variant === "nav" ? srcSize : Math.round((srcSize * PATS_LOGO.height) / PATS_LOGO.width)}
      quality={95}
      priority={priority}
      sizes={
        cssSized && className?.includes("paf-footer__logo")
          ? "(min-width: 640px) 108px, 88px"
          : cssSized
            ? `${size}px`
            : `${size}px`
      }
      className={cn("object-contain", className)}
      style={
        cssSized
          ? { width: size, height: size, ...style }
          : { width: size, height: size, ...style }
      }
    />
  );
}
