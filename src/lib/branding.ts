/** Site-wide branding — public-facing competition portal. */
export const SITE_NAME = "PATS";
export const COMPETITION_NAME = "PATS Competition";
export const ARMY_NAME = "Pakistan Army";
export const COUNTRY = "Pakistan";
export const HQ_ORG = "General Headquarters Rawalpindi";

/** Public navbar branding — PAF-style stacked lockup (DESIGN_SPEC) */
export const NAV_BRAND_TITLE = "PATS";
export const NAV_BRAND_SUBTITLE = "Pakistan Army Team Spirit";
/** Motto — hero/footer only; not shown in navbar */
export const NAV_BRAND_TAGLINE = "No guts, no glory";

/** Official PATS emblem — used site-wide (nav, portal, admin, favicons). Square crest. */
export const PATS_LOGO = {
  src: "/media/pats/pats-logo.webp",
  navSrc: "/media/pats/pats-logo-nav.webp",
  alt: "PATS — International Pakistan Army Team Spirit Competition",
  width: 1024,
  height: 1024,
} as const;

/** Public hero & metadata */
/** Homepage hero headline — keep wording fixed; style/layout may change around it. */
export const HERO_TITLE = "Pakistan Army Team Spirit (PATS) Competition";
export const HERO_TAGLINE = `${ARMY_NAME} · ${COUNTRY}`;
/** Homepage hero body copy — keep wording fixed; style/layout may change around it. */
export const HERO_DESCRIPTION =
  "International Pakistan Army Team Spirit — a 60-hour patrolling exercise testing tactical mastery, endurance, and team spirit among partner nations.";
/**
 * Hero motto — the official Urdu motto from the PATS crest.
 * Transliteration: "Yaqeen-e-Muhkam, Amal-e-Paiham, Mohabbat Fateh-e-Aalam".
 * Rendered RTL with a nastaliq font (see `.pats-urdu-motto` in globals.css).
 */
export const HERO_MOTTO = "یقین محکم ، عمل پیہم ، محبت فاتح عالم";

export const SITE_DESCRIPTION = `Official ${COMPETITION_NAME} participation portal — ${SITE_NAME}`;

/** Admin / system (not shown on public marketing copy) */
export const SITE_PORTAL_TITLE = "PATS WEB PORTAL";
export const SITE_SUBTITLE = "International Participation Management System";
export const JLA = "Junior Leaders Academy (JLA)";
export const ADMIN_PORTAL_LABEL = "PATS Administrative Console";
export const FOOTER_BRAND_DESCRIPTION =
  "Official participation portal for the PATS Competition. Secure registration, scheduling, and team coordination.";
// Footer legal line is localized via `publicSite.footer.disclaimer` (all locales).

export const PORTAL_TAGLINE = HERO_TAGLINE;
export const SUPPORT_EMAIL = "support@example.com";
