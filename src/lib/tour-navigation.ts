/**
 * "Tour" — the former public marketing site, now part of the participant
 * portal.
 *
 * The main website is deliberately tiny: the cinematic home page plus the login
 * flow. Everything else (events, awards, gallery, announcements, key dates,
 * news…) lives behind a login and is reached from the portal sidebar's *Tour*
 * item. The pages keep their original URLs — only the chrome and the access
 * gate changed — so internal links, revalidation paths and bookmarks all still
 * resolve.
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

export function pathnameIsTourPage(pathname: string): boolean {
  return TOUR_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Tour navbar items — the public list without *Home*: inside the portal the
 * brand mark returns to the tour index and the sidebar owns the way back to
 * the dashboard, so a "Home" entry would only point at the marketing page the
 * participant has already logged in past.
 */
export const TOUR_NAV_ITEMS: PublicNavItem[] = PUBLIC_NAV_ITEMS.filter(
  (item) => item.href !== "/"
);

/** Sections listed on the /tour index, in navbar order. */
export const TOUR_SECTIONS = TOUR_NAV_ITEMS.flatMap((item) =>
  item.children?.length
    ? item.children.map((child) => ({ href: child.href, label: child.label }))
    : item.href
      ? [{ href: item.href, label: item.label }]
      : []
);
