import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY, TICKET_STATUS } from "@/lib/constants";
import {
  ApiError,
  handleApiError,
  requireAuth,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { TicketReplySchema } from "@/lib/validations";
import { buildAdminTicketUrl, notifyTicket } from "@/lib/tickets";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = TicketReplySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true, subject: true },
    });
    if (!ticket || ticket.userId !== session.user.id) {
      throw new ApiError("Ticket not found", 404);
    }
    if (ticket.status === TICKET_STATUS.CLOSED) {
      throw new ApiError("This ticket is closed", 409);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, email: true },
    });
    const authorName = user
      ? `${user.firstName} ${user.lastName}`.trim()
      : "Participant";

    // A reply on a resolved ticket reopens it for the team.
    const nextStatus =
      ticket.status === TICKET_STATUS.RESOLVED
        ? TICKET_STATUS.OPEN
        : ticket.status;

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: session.user.id,
        authorRole: "user",
        authorName,
        body: parsed.data.body,
      },
      select: {
        id: true,
        authorRole: true,
        authorName: true,
        body: true,
        createdAt: true,
      },
    });

    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { lastReplyAt: new Date(), status: nextStatus },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.TICKET,
      entityId: ticket.id,
      action: "ticket_user_reply",
      actorId: session.user.id,
    });

    const staffInbox =
      process.env.SUPPORT_NOTIFY_EMAIL ?? process.env.SMTP_USER;
    if (staffInbox) {
      await notifyTicket({
        to: staffInbox,
        subject: `Ticket reply: ${ticket.subject}`,
        text: [
          `${authorName} replied to their support ticket:`,
          "",
          parsed.data.body,
          "",
          `Review: ${buildAdminTicketUrl(ticket.id)}`,
        ].join("\n"),
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
