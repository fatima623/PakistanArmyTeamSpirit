import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY, TICKET_STATUS } from "@/lib/constants";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { TicketReplySchema } from "@/lib/validations";
import { buildParticipantTicketUrl, notifyTicket } from "@/lib/tickets";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
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
      select: {
        id: true,
        subject: true,
        user: { select: { email: true, firstName: true } },
      },
    });
    if (!ticket) {
      throw new ApiError("Ticket not found", 404);
    }

    const staff = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true },
    });
    const authorName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : "Support team";

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: session.user.id,
        authorRole: "staff",
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

    // A team reply moves the ticket into active handling.
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        lastReplyAt: new Date(),
        status: TICKET_STATUS.IN_PROGRESS,
        closedAt: null,
      },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.TICKET,
      entityId: ticket.id,
      action: "ticket_staff_reply",
      actorId: session.user.id,
    });

    if (ticket.user?.email) {
      await notifyTicket({
        to: ticket.user.email,
        subject: `New reply on your support ticket: ${ticket.subject}`,
        text: [
          `Hello ${ticket.user.firstName},`,
          "",
          "The PATS support team replied to your ticket:",
          "",
          parsed.data.body,
          "",
          `View and reply: ${buildParticipantTicketUrl(ticket.id)}`,
        ].join("\n"),
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
