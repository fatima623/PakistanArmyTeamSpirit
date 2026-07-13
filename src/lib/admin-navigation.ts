/**
 * Single source of truth for admin sidebar labels and page header titles.
 */

/** Roles that may see each nav item. Writes are still enforced per-API. */
const ALL_STAFF = ["admin", "mtd", "sdbs"] as const;
const ADMIN_ONLY = ["admin"] as const;

/** Sidebar groups, rendered in this order. */
export const ADMIN_NAV_GROUPS = ["Operations", "Content", "System"] as const;
export type AdminNavGroup = (typeof ADMIN_NAV_GROUPS)[number];

export const ADMIN_NAV_ITEMS = [
  { key: "dashboard", href: "/admin", label: "Dashboard", roles: ALL_STAFF, group: "Operations" },
  {
    key: "users",
    href: "/admin/users",
    label: "Participation Requests",
    roles: ALL_STAFF,
    group: "Operations",
  },
  {
    key: "payments",
    href: "/admin/payments",
    label: "Payment Verification",
    roles: ALL_STAFF,
    group: "Operations",
  },
  {
    key: "units",
    href: "/admin/units",
    label: "Participating Teams",
    roles: ALL_STAFF,
    group: "Operations",
  },
  {
    key: "teamRequests",
    href: "/admin/team-requests",
    label: "Team Size Requests",
    roles: ALL_STAFF,
    group: "Operations",
  },
  {
    key: "flights",
    href: "/admin/flights",
    label: "Flight Details",
    roles: ALL_STAFF,
    group: "Operations",
  },
  {
    key: "tickets",
    href: "/admin/tickets",
    label: "Support Tickets",
    roles: ADMIN_ONLY,
    group: "Operations",
  },
  {
    key: "userManagement",
    href: "/admin/user-management",
    label: "User Management",
    roles: ADMIN_ONLY,
    group: "Operations",
  },
  { key: "news", href: "/admin/news", label: "Announcements", roles: ADMIN_ONLY, group: "Content" },
  { key: "events", href: "/admin/events", label: "Events Management", roles: ADMIN_ONLY, group: "Content" },
  { key: "gallery", href: "/admin/gallery", label: "Gallery Management", roles: ADMIN_ONLY, group: "Content" },
  {
    key: "ticker",
    href: "/admin/ticker",
    label: "Ticker Messages",
    roles: ADMIN_ONLY,
    group: "Content",
  },
  { key: "keyDates", href: "/admin/key-dates", label: "Key Dates", roles: ADMIN_ONLY, group: "Content" },
  { key: "settings", href: "/admin/settings", label: "Site Settings", roles: ADMIN_ONLY, group: "System" },
] as const;

export type AdminNavKey = (typeof ADMIN_NAV_ITEMS)[number]["key"];
export type AdminNavItem = (typeof ADMIN_NAV_ITEMS)[number];

/** Nav items visible to the given staff role. */
export function adminNavItemsForRole(role: string | null | undefined) {
  const r = role ?? "";
  return ADMIN_NAV_ITEMS.filter((item) =>
    (item.roles as readonly string[]).includes(r)
  );
}

/** Role-visible nav items organised into ordered, non-empty groups. */
export function adminNavGroupsForRole(role: string | null | undefined) {
  const items = adminNavItemsForRole(role);
  return ADMIN_NAV_GROUPS.map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  })).filter((g) => g.items.length > 0);
}

const labels = Object.fromEntries(
  ADMIN_NAV_ITEMS.map((item) => [item.key, item.label])
) as Record<AdminNavKey, string>;

/** Sidebar label and AdminShell header title for a section. */
export function adminNavLabel(key: AdminNavKey): string {
  return labels[key];
}

/** Resolve section from a pathname (e.g. for client components). */
export function resolveAdminNavKey(pathname: string): AdminNavKey | undefined {
  const sorted = [...ADMIN_NAV_ITEMS].sort(
    (a, b) => b.href.length - a.href.length
  );

  for (const item of sorted) {
    if (pathname === item.href) {
      return item.key;
    }
    if (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)) {
      return item.key;
    }
  }

  return undefined;
}

export function adminNavLabelForPath(pathname: string): string {
  const key = resolveAdminNavKey(pathname);
  return key ? adminNavLabel(key) : "Dashboard";
}
