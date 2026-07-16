/**
 * Album categories for the public gallery. `GalleryImage.category` is free text
 * in the schema, so these are the curated suggestions the admin form offers and
 * the order the public gallery groups them in — an image with a category outside
 * this list still renders, it just sorts after the known ones.
 */
export const GALLERY_CATEGORIES = [
  "Opening Ceremony",
  "Competition Events",
  "International Delegations",
  "Equipment Demonstrations",
  "Awards & Recognition",
  "Training Activities",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** Bucket for images saved before categories existed / left blank. */
export const UNCATEGORISED_LABEL = "Field Archive";

/** Curated order first, then anything custom alphabetically, archive last. */
export function compareCategories(a: string, b: string): number {
  if (a === b) return 0;
  if (a === UNCATEGORISED_LABEL) return 1;
  if (b === UNCATEGORISED_LABEL) return -1;
  const list = GALLERY_CATEGORIES as readonly string[];
  const ia = list.indexOf(a);
  const ib = list.indexOf(b);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return a.localeCompare(b);
}
