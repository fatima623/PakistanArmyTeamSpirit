/**
 * Core cinematic experience — do not remove.
 * Homepage and all public marketing pages use this video + scroll parallax.
 */
export const HERO_VIDEO_SRC = "/media/pats/hero/hero-720.mp4";

export const HERO_VIDEO_POSTER = "/media/pats/hero/hero-poster.webp";

/** Default parallax travel (px) for hero video on scroll */
export const HERO_PARALLAX_SCROLL = 120;

/** Section parallax speeds (px at full scroll range) */
export const SECTION_PARALLAX = {
  slow: 40,
  medium: 70,
  fast: 100,
} as const;

export type SectionParallaxSpeed = keyof typeof SECTION_PARALLAX;
