/** Public marketing shell — layout modes. */

const PAGE_BANNER_PATHS = new Set([
  "/operations",
  "/international",
  "/awards",
  "/announcements",
  // "/gallery" — no photo banner; the gallery grid leads the page directly.
  "/documents",
  "/key-dates",
  "/privacy",
  "/event/register",
  "/event/login",
  "/event/forgot-password",
]);

/** Homepage only — full-viewport cinematic hero. */
export function pathnameHasFullscreenHero(pathname: string): boolean {
  return pathname === "/";
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
  if (pathname === "/") return true;
  if (pathname.startsWith("/operations")) return true;
  if (pathname.startsWith("/international")) return true;
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
  return pathname !== "/" && pathnameIsCinematicFullWidth(pathname);
}

/** Standalone pages that render bare — no global header/nav, ticker or footer. */
const BARE_CHROME_PREFIXES: string[] = [];

/** True for pages that should show only their own content (no site chrome). */
export function pathnameHidesSiteChrome(pathname: string): boolean {
  return BARE_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export { pathnameIsParticipantPortalApp } from "@/lib/participant-portal-paths";
