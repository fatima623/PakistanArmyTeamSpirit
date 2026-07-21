import silverMedal from "../../MEDIA PATS/Silver medal.webp";
import innerPageHero38 from "../../MEDIA PATS/38.webp";
import mediaPats28 from "../../MEDIA PATS/28.webp";

/** Processed PATS media — crops from MEDIA PATS via scripts/process-pats-media.py */

const BASE = "/media/pats";

export function bookletPage(n: number) {
  return `${BASE}/booklet/page-${String(n).padStart(2, "0")}.webp`;
}

export function brandingCover(n: number) {
  return `${BASE}/branding/cover-${n}.webp`;
}

export function galleryEdition(n: number) {
  return `${BASE}/gallery/edition-${n}.webp`;
}

export function panelImage(n: number) {
  return `${BASE}/panels/panel-${n}.webp`;
}

/** Website-ready crops (no raw phone scans). */
export const PATS_CROP = {
  cardRegister: `${BASE}/crops/card-register.webp`,
  cardOperations: `${BASE}/crops/card-operations.webp`,
  cardInternational: `${BASE}/crops/card-international.webp`,
  aboutFeature: `${BASE}/crops/about-feature.webp`,
  navEmblem: "/media/pats/pats-logo-nav.webp",
  logoFull: "/media/pats/pats-logo.webp",
  /** MEDIA PATS/logo.png — faded watermark (footer-style) */
  logoWatermark: "/images/logo.webp",
  videoConcept: `${BASE}/crops/video-concept.webp`,
  videoGallery: `${BASE}/crops/video-gallery.webp`,
  videoOperations: `${BASE}/crops/video-operations.webp`,
  /** Awards showcase feature (was MEDIA PATS/32, since removed) */
  awardsFeature: "/media/pats/crops/award-certificate.webp",
  footerTexture: `${BASE}/crops/footer-texture.webp`,
  galleryHero: `${BASE}/crops/gallery-hero.webp`,
  galleryAlt: `${BASE}/crops/gallery-alt.webp`,
  documentsThumb: `${BASE}/crops/documents-thumb.webp`,
  /** Wide landscape — default inner-page hero (1230px) */
  pageHeroDefault: `${BASE}/crops/footer-bg.webp`,
  /** MEDIA PATS/38 — default static hero for all non-home public pages */
  pageHeroInner38: innerPageHero38.src,
  /** MEDIA PATS/7 — full frame, max 1280px long edge */
  pageHeroOperations: `${BASE}/crops/page-hero-operations.webp`,
  /** MEDIA PATS/28.png — homepage mission triptych (right column) */
  photo28Png: mediaPats28.src,
  /** MEDIA PATS/28 — processed transparent; parallax / admin watermark only */
  photo28: `${BASE}/crops/bg-28-logos.webp`,
  /** MEDIA PATS/28 — transparent footer mark (green left disk, no paper matte) */
  photo28Footer: `${BASE}/crops/photo-28-footer.webp?v=2`,
  /** MEDIA PATS/28 — full-color source (archival; has white paper) */
  photo28Full: `${BASE}/crops/photo-28.webp`,
  /** Awards / certificate imagery (was MEDIA PATS/Awards, since removed) */
  awardsGrid: "/awards/certificate.webp",
  /** Gold medal (was MEDIA PATS/Gold medal, since removed) */
  goldMedal: "/awards/pats-medal-gold.png",
  /** MEDIA PATS/Silver medal.png */
  silverMedal: silverMedal.src,
  /** Split from Awards.png — bronze & certificate quadrants */
  awardBronze: "/awards/bronze.webp",
  awardCertificate: "/awards/certificate.webp",
  /** Medal-only display crops (no baked-in score labels) */
  goldMedalDisplay: "/awards/gold-display.webp",
  silverMedalDisplay: "/awards/silver-display.webp",
  awardBronzeDisplay: "/awards/bronze-display.webp",
  awardCertificateDisplay: "/awards/certificate-display.webp",
} as const;

/** @deprecated Use PATS_CROP — kept for gradual migration */
export const MEDIA = {
  heroCover: brandingCover(25),
  mottoCover: PATS_CROP.cardRegister,
  editionCover: brandingCover(27),
  bookletCover: bookletPage(1),
  conceptMap: PATS_CROP.videoConcept,
  layoutEvents: PATS_CROP.cardOperations,
  awardsPage: PATS_CROP.awardsFeature,
  teamComposition: bookletPage(17),
  gallery2016: PATS_CROP.galleryAlt,
  gallery2020: galleryEdition(23),
  gallery2021: PATS_CROP.galleryAlt,
  gallery2022: PATS_CROP.galleryHero,
  eventsPanel: panelImage(30),
  overviewPanel: PATS_CROP.aboutFeature,
} as const;
