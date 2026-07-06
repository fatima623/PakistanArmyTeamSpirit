export const ROLES = {
  USER: "user",
  SDBS: "sdbs",
  MTD: "mtd",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles permitted to load the /admin console. */
export const STAFF_ROLES: string[] = [ROLES.ADMIN, ROLES.MTD, ROLES.SDBS];

/** Roles an admin may assign to a user. */
export const ASSIGNABLE_ROLES: string[] = [
  ROLES.USER,
  ROLES.SDBS,
  ROLES.MTD,
  ROLES.ADMIN,
];

export const ROLE_LABELS: Record<string, string> = {
  user: "Participant",
  sdbs: "SDBS (viewer)",
  mtd: "MTD (approver)",
  admin: "Administrator",
};

export function roleLabel(role: string | null | undefined): string {
  return (role && ROLE_LABELS[role]) || role || "—";
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

/** MTD and Admin may approve / return registrations. */
export function canApproveRegistration(
  role: string | undefined | null
): boolean {
  return role === ROLES.ADMIN || role === ROLES.MTD;
}

/** Only full admins manage settings, content, payments, roles, and deletion. */
export function canManageSystem(role: string | undefined | null): boolean {
  return role === ROLES.ADMIN;
}

/** Post-login / role-based home route. */
export function getRoleHomePath(role: string | undefined | null): string {
  return isStaffRole(role) ? "/admin" : "/event/dashboard";
}
