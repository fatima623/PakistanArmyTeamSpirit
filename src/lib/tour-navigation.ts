/**
 * "Tour" — the former public marketing site, now part of the participant
 * portal.
 *
 * The main website is deliberately tiny: a single sign-in screen at `/` that
 * reveals nothing about the exercise. Everything else — the home page itself
 * plus events, awards, gallery, announcements, key dates, news… — lives behind
 * a login and is reached from the portal sidebar's *Tour* item. The section
 * pages keep their original URLs, so internal links, revalidation paths and
 * bookmarks all still resolve.
 */

import { PUBLIC_NAV_ITEMS, type PublicNavItem } from "@/lib/public-navigation";

export const TOUR_HOME = "/tour";

/** Route prefixes that belong to the tour (login required). */
export const TOUR_PREFIXES = [
  "/tour",
  "/events-detail",
  "/international",
  "/familiarization",
  "/awards",
  "/gallery",
  "/announcements",
  "/key-dates",
  "/news",
  "/documents",
  "/operations",
  "/exercise-contour",
  "/page",
] as const;

/**
 * The tour's own index page — the former public home page. It is the only tour
 * route with the full-viewport cinematic hero, so the layout, the navbar and
 * the day/night switch all key off it the way they used to key off `/`.
 */
export function pathnameIsTourIndex(pathname: string): boolean {
  return pathname === TOUR_HOME;
}

export function pathnameIsTourPage(pathname: string): boolean {
  return TOUR_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Tour navbar items — the public list with *Home* repointed at the tour index,
 * which now renders the former public home page. Everything else keeps its
 * original href, so the tour is the marketing site verbatim, one login in.
 */
export const TOUR_NAV_ITEMS: PublicNavItem[] = PUBLIC_NAV_ITEMS.map((item) =>
  item.href === "/" ? { ...item, href: TOUR_HOME } : item
);
