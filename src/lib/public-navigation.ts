/** Public marketing navigation — DESIGN_SPEC layout (desktop + mega overlay). */

export type PublicNavChild = {
  href: string;
  label: string;
};

export type PublicNavItem = {
  label: string;
  href?: string;
  children?: PublicNavChild[];
};

export const PUBLIC_NAV_ITEMS: PublicNavItem[] = [
  { href: "/", label: "Home" },
  // { href: "/operations", label: "Operational Overview" },
  // Exercise Contour is temporarily hidden from the navbar (kept for future use).
  // { href: "/exercise-contour", label: "Exercise Contour" },
  { href: "/events-detail", label: "Events Detail" },
  { href: "/international", label: "International Participation" },
  { href: "/awards", label: "Awards" },
  { href: "/gallery", label: "Gallery" },
  { href: "/announcements", label: "Announcements" },
  { href: "/key-dates", label: "Key Dates" },
];

export function isNavItemActive(pathname: string, item: PublicNavItem): boolean {
  if (item.children?.length) {
    return item.children.some((c) => isHrefActive(pathname, c.href));
  }
  if (!item.href) return false;
  return isHrefActive(pathname, item.href);
}

/** Normalize for comparisons (strip trailing slash). */
export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isHrefActive(pathname: string, href: string): boolean {
  const path = normalizePathname(pathname);
  const target = normalizePathname(href);
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}
