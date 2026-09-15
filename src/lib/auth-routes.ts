export const ROLES = {
  USER: "user",
  SDBS: "sdbs",
  MTD: "mtd",
  ADMIN: "admin",
  HOST: "host",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles permitted to load the /admin console. */
export const STAFF_ROLES: string[] = [ROLES.ADMIN, ROLES.MTD, ROLES.SDBS];

/**
 * The ONLY role that is an event participant.
 *
 * Admin participation lists, counts, charts and exports must scope on this
 * (an allowlist) — never on `role: { not: "admin" }`, which is a denylist that
 * silently admits every role added later (sdbs, mtd, and now host).
 */
export const PARTICIPANT_ROLE: string = ROLES.USER;

/** Roles an admin may assign to a user. */
export const ASSIGNABLE_ROLES: string[] = [
  ROLES.USER,
  ROLES.SDBS,
  ROLES.MTD,
  ROLES.ADMIN,
];

/**
 * Display names for the staff roles.
 *
 * `sdbs` and `mtd` are the two Directorates, and their acronyms are fixed:
 * **SD Dte = Staff Duties Directorate** and **MT Dte = Military Training
 * Directorate**. Nothing else. Keep every user-facing expansion in this file so
 * the two can never drift apart again — read them from here rather than
 * re-typing the words in a component.
 */
export const ROLE_LABELS: Record<string, string> = {
  user: "Participant",
  sdbs: "SD Dte (Staff Duties Directorate)",
  mtd: "MT Dte (Military Training Directorate)",
  admin: "Administrator",
  host: "Host Formation",
};

/** Compact forms, for pills and other chrome too narrow for the full name. */
export const ROLE_SHORT_LABELS: Record<string, string> = {
  user: "Participant",
  sdbs: "SD Dte",
  mtd: "MT Dte",
  admin: "Administrator",
  host: "Host Formation",
};

export function roleLabel(role: string | null | undefined): string {
  return (role && ROLE_LABELS[role]) || role || "—";
}

export function roleShortLabel(role: string | null | undefined): string {
  return (role && ROLE_SHORT_LABELS[role]) || role || "—";
}

/** True only for full administrators. */
export function isAdminRole(role: string | undefined | null): boolean {
  return role === ROLES.ADMIN;
}

/** Any back-office team member (admin, MTD, or SDBS). */
export function isStaffRole(role: string | undefined | null): boolean {
  return !!role && STAFF_ROLES.includes(role);
}

/** Anyone who may open the /admin console. */
export function canAccessAdminArea(role: string | undefined | null): boolean {
  return isStaffRole(role);
}

/**
 * Registration verification is performed EXCLUSIVELY by the SD Dte (Staff
 * Duties Directorate). Admin and MT Dte have read-only visibility.
 */
export function canApproveRegistration(
  role: string | undefined | null
): boolean {
  return role === ROLES.SDBS;
}

/** Only full admins manage settings, content, roles, and deletion. */
export function canManageSystem(role: string | undefined | null): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Host Formation login. Deliberately NOT a staff role — hosts get a
 * read-only /host dashboard and must never reach /admin or the participant
 * portal. Kept out of STAFF_ROLES/ASSIGNABLE_ROLES for exactly this reason.
 */
export function isHostRole(role: string | undefined | null): boolean {
  return role === ROLES.HOST;
}

/** Anyone who may open the read-only /host area. */
export function canAccessHostArea(role: string | undefined | null): boolean {
  return isHostRole(role);
}

/**
 * The support desk.
 *
 * A participant's query is raised once and answered by whoever picks it up, so
 * every ticket is a shared conversation: it is visible to — and answerable by —
 * ALL back-office roles plus the Host Formation login. Host is included here
 * and nowhere else; it stays out of `STAFF_ROLES` so it still cannot reach
 * /admin or the participant portal.
 */
export const TICKET_DESK_ROLES: string[] = [
  ROLES.ADMIN,
  ROLES.MTD,
  ROLES.SDBS,
  ROLES.HOST,
];

export function canAccessTicketDesk(role: string | undefined | null): boolean {
  return !!role && TICKET_DESK_ROLES.includes(role);
}

/** Post-login / role-based home route. */
export function getRoleHomePath(role: string | undefined | null): string {
  if (isStaffRole(role)) return "/admin";
  if (isHostRole(role)) return "/host";
  return "/event/dashboard";
}
