import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Public marketing nav labels are stored per-href rather than on the nav item
 * itself, so the two nav implementations (PatsNavigation and CinematicNav) and
 * their differing item lists (PUBLIC_NAV_ITEMS / PUBLIC_NAV) resolve the same
 * dictionary strings from one place.
 */
export function publicNavLabels(t: Dictionary): Record<string, string> {
  return {
    "/": t.publicSite.nav.home,
    "/events-detail": t.publicSite.nav.eventsDetail,
    "/operations": t.publicSite.nav.operations,
    "/exercise-contour": t.publicSite.nav.exerciseContour,
    "/international": t.publicSite.nav.international,
    "/awards": t.publicSite.nav.awards,
    "/gallery": t.publicSite.nav.gallery,
    "/announcements": t.publicSite.nav.announcements,
    "/documents": t.publicSite.nav.documents,
    "/key-dates": t.publicSite.nav.keyDates,
  };
}

/** Translated label for `href`, falling back to the item's English label. */
export function publicNavLabel(
  t: Dictionary | null,
  href: string | undefined,
  fallback: string
): string {
  if (!t || !href) return fallback;
  return publicNavLabels(t)[href] ?? fallback;
}
