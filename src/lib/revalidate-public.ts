import { revalidatePath } from "next/cache";

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
}

export function revalidateGalleryPaths() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
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
  revalidatePublicSite();
  revalidatePath("/event/login");
  revalidatePath("/event/dashboard");
  revalidatePath("/admin/ticker");
}
