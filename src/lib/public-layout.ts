/** Public marketing shell — layout modes. */

import { TOUR_HOME } from "@/lib/tour-navigation";

/* Routes that open with a `PatsPageHero` banner. The banner is designed to
   bleed UNDER the fixed chrome (it reserves the header's height itself), so the
   body drops its top padding for these paths. A page listed here without a
   banner would render its first heading beneath the navbar — which is why
   /events-detail, whose catalogue starts with a plain `ec-hero` label, is not
   in this set. */
const PAGE_BANNER_PATHS = new Set([
  "/operations",
  "/international",
  "/familiarization",
  "/awards",
  "/announcements",
  "/gallery",
  "/documents",
  "/key-dates",
  "/privacy",
  "/event/register",
  "/event/forgot-password",
]);

/** Tour home only — full-viewport cinematic hero (the former `/`). */
export function pathnameHasFullscreenHero(pathname: string): boolean {
  return pathname === TOUR_HOME;
}

/** Inner routes with compact photo/video banner (PAF internal page header). */
export function pathnameHasPageBanner(pathname: string): boolean {
  if (PAGE_BANNER_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/news/") && pathname.length > "/news".length) return true;
  if (pathname.startsWith("/announcements/") && pathname.length > "/announcements".length) {
    return true;
  }
  if (pathname.startsWith("/event/reset-password/")) return true;
  return false;
}

/** Nav floats over hero media (home full-screen or inner compact banner). */
export function pathnameHasHeroOverlay(pathname: string): boolean {
  return pathnameHasFullscreenHero(pathname) || pathnameHasPageBanner(pathname);
}

export function pathnameIsCinematicFullWidth(pathname: string): boolean {
  if (pathname.startsWith("/tour")) return true;
  if (pathname.startsWith("/events-detail")) return true;
  if (pathname.startsWith("/operations")) return true;
  if (pathname.startsWith("/international")) return true;
  if (pathname.startsWith("/familiarization")) return true;
  if (pathname.startsWith("/awards")) return true;
  if (pathname.startsWith("/gallery")) return true;
  if (pathname.startsWith("/announcements")) return true;
  if (pathname.startsWith("/documents")) return true;
  if (pathname.startsWith("/exercise-contour")) return true;
  if (pathname.startsWith("/event")) return true;
  if (pathname.startsWith("/news")) return true;
  if (pathname === "/key-dates" || pathname === "/privacy") return true;
  return false;
}

/** Light content shell (PAF-style body below compact banner). */
export function pathnameUsesInnerPageShell(pathname: string): boolean {
  if (pathname === TOUR_HOME) return false;
  // Bare pages own their whole viewport — the padded inner shell would only
  // push their (already centred) card off-centre.
  if (pathnameHidesSiteChrome(pathname)) return false;
  return pathnameIsCinematicFullWidth(pathname);
}

/**
 * Standalone pages that render bare — no global header/nav, ticker or footer.
 * The sign-in screen is one: it is reached from the bare landing page (usually
 * as a dialog over it), so site chrome there would reintroduce exactly the
 * pre-login navigation the landing page exists to remove.
 */
const BARE_CHROME_PREFIXES: string[] = ["/event/login"];

/** True for pages that should show only their own content (no site chrome). */
export function pathnameHidesSiteChrome(pathname: string): boolean {
  return BARE_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export { pathnameIsParticipantPortalApp } from "@/lib/participant-portal-paths";
