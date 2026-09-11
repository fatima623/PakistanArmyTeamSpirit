import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { TICKET_DESK_ROLES, canAccessTicketDesk } from "@/lib/auth-routes";

/* Pure author-role helpers live in `ticket-roles` so the client-side thread
   view can import them without dragging Prisma and the mailer along. */
export {
  isStaffAuthorRole,
  ticketAuthorRole,
  ticketAuthorRoleLabel,
} from "@/lib/ticket-roles";

/**
 * Roles allowed to act as support "team" members (respond to / manage tickets).
 * The desk is shared: Admin, MT, SD and the Host Formation login all see every
 * ticket and all reply into the same thread. `TICKET_DESK_ROLES` is the single
 * source of that list.
 */
export const TICKET_STAFF_ROLES = TICKET_DESK_ROLES;

export function isTicketStaffRole(role: string | null | undefined): boolean {
  return canAccessTicketDesk(role);
}

/**
 * Resolve a quote-reply target.
 *
 * Returns the id only when the quoted message really belongs to this ticket,
 * so a reply can never be stitched onto a message from someone else's thread.
 * An unknown id degrades to a plain (unquoted) message rather than an error —
 * the message the sender is answering may have been deleted meanwhile.
 */
export async function resolveTicketReplyTarget(
  ticketId: string,
  replyToId: string | null | undefined
): Promise<string | null> {
  if (!replyToId) return null;
  const target = await prisma.ticketMessage.findFirst({
    where: { id: replyToId, ticketId },
    select: { id: true },
  });
  return target?.id ?? null;
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
