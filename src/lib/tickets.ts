import { sendMail } from "@/lib/mail";

/**
 * Roles allowed to act as support "team" members (respond to / manage tickets).
 * Currently only `admin`; extend this when the MTD / SDBS roles are introduced
 * so ticket staffing stays in one place.
 */
export const TICKET_STAFF_ROLES = ["admin"] as const;

export function isTicketStaffRole(role: string | null | undefined): boolean {
  return !!role && (TICKET_STAFF_ROLES as readonly string[]).includes(role);
}

/** Author-role snapshot stored on each message ("staff" vs "user"). */
export function ticketAuthorRole(role: string | null | undefined): string {
  return isTicketStaffRole(role) ? "staff" : "user";
}

function appBaseUrl(): string {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function buildParticipantTicketUrl(ticketId: string): string {
  return `${appBaseUrl()}/event/tickets/${ticketId}`;
}

export function buildAdminTicketUrl(ticketId: string): string {
  return `${appBaseUrl()}/admin/tickets/${ticketId}`;
}

/**
 * Best-effort notification — never throws, so a mail outage can't fail the
 * request that triggered it.
 */
export async function notifyTicket(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  try {
    await sendMail(options);
  } catch (error) {
    console.error("[tickets] notification email failed:", error);
  }
}
