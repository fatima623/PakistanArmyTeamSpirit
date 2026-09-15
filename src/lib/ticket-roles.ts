/**
 * Message-author helpers for the ticket thread.
 *
 * Split out of `lib/tickets.ts` on purpose: that module pulls in Prisma and the
 * mailer, and the thread view is a client component. Everything here is pure.
 */

import { ROLE_SHORT_LABELS, canAccessTicketDesk } from "@/lib/auth-routes";

/**
 * Author-role snapshot stored on each message.
 *
 * The concrete role is stored (`admin` / `mtd` / `sdbs` / `host` / `user`) so a
 * group thread can say which desk each reply came from. Messages written before
 * the desk was shared carry the older flat `"staff"` value, which
 * `isStaffAuthorRole` still recognises.
 */
export function ticketAuthorRole(role: string | null | undefined): string {
  return canAccessTicketDesk(role) ? (role as string) : "user";
}

/** True for any message NOT written by the participant who raised the ticket. */
export function isStaffAuthorRole(role: string | null | undefined): boolean {
  return !!role && role !== "user";
}

/**
 * Badge text for a message author. Empty for the participant (their name is
 * already shown), and a generic team label for the legacy flat `"staff"` role
 * and anything unrecognised. Uses the short role names — this sits inside a
 * chat bubble, where "SD Dte" reads and "SD Dte (Staff Duties Directorate)"
 * would wrap.
 */
export function ticketAuthorRoleLabel(
  role: string | null | undefined,
  fallback = "PATS team"
): string {
  if (!role || role === "user") return "";
  return ROLE_SHORT_LABELS[role] ?? fallback;
}
