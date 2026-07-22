import { revalidatePath, revalidateTag } from "next/cache";

/** Invalidate public pages after admin content changes. */
export function revalidatePublicSite() {
  revalidatePath("/");
  revalidatePath("/key-dates");
  revalidatePath("/page/key-dates");
  revalidatePath("/privacy");
}

export function revalidateNewsPaths() {
  revalidatePublicSite();
  revalidatePath("/announcements");
  // Every dynamic instance of the detail route: without this, an edited
  // announcement's card updated but its permalink kept serving stale HTML
  // from the full route cache.
  revalidatePath("/announcements/[slug]", "page");
  revalidatePath("/admin/news");
  // Announcements also scroll in the site-wide marquee (public chrome), so an
  // edit must refresh the cached rows and every ISR'd public page, not just
  // the announcement routes themselves.
  revalidateTag("announcements");
  revalidatePath("/", "layout");
}

export function revalidateGalleryPaths() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export function revalidateHeroPaths() {
  // The hero lives on the home page, which is ISR'd at 1h — without this an
  // edited slide would not surface until the window expired.
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export function revalidateEventPaths() {
  revalidatePath("/events-detail");
  revalidatePath("/exercise-contour");
  revalidatePath("/admin/events");
}

export function revalidateKeyDatesPaths() {
  revalidatePublicSite();
  revalidatePath("/admin/key-dates");
}

export function revalidateTickerPaths() {
  // Ticker messages only surface on the participant dashboard now — the
  // public marquee scrolls Announcements (see revalidateNewsPaths).
  revalidatePath("/event/dashboard");
  revalidatePath("/admin/ticker");
}
