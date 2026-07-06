import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import {
  AUDIT_ENTITY,
  TICKET_STATUS,
  TICKET_STATUS_LABELS,
  type TicketStatus,
} from "@/lib/constants";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { AdminTicketUpdateSchema } from "@/lib/validations";
import {
  buildParticipantTicketUrl,
  isTicketStaffRole,
  notifyTicket,
} from "@/lib/tickets";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: {
        id: true,
        subject: true,
        category: true,
        status: true,
        priority: true,
        createdAt: true,
        lastReplyAt: true,
        closedAt: true,
        assignedToId: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            applicationStatus: true,
            paymentStatus: true,
          },
        },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            authorRole: true,
            authorName: true,
            body: true,
            createdAt: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new ApiError("Ticket not found", 404);
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = AdminTicketUpdateSchema.safeParse(body);
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
        status: true,
        subject: true,
        user: { select: { email: true, firstName: true } },
      },
    });
    if (!ticket) {
      throw new ApiError("Ticket not found", 404);
    }

    const data: {
      status?: TicketStatus;
      priority?: string;
      assignedToId?: string | null;
      closedAt?: Date | null;
    } = {};

    if (parsed.data.priority) {
      data.priority = parsed.data.priority;
    }

    if (parsed.data.assignedToId !== undefined) {
      if (parsed.data.assignedToId) {
        const assignee = await prisma.user.findUnique({
          where: { id: parsed.data.assignedToId },
          select: { role: true },
        });
        if (!assignee || !isTicketStaffRole(assignee.role)) {
          throw new ApiError("Assignee must be a support team member", 400);
        }
      }
      data.assignedToId = parsed.data.assignedToId || null;
    }

    if (parsed.data.status) {
      data.status = parsed.data.status;
      data.closedAt =
        parsed.data.status === TICKET_STATUS.CLOSED ? new Date() : null;
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data,
      select: {
        id: true,
        status: true,
        priority: true,
        assignedToId: true,
        closedAt: true,
      },
    });

    const statusChanged =
      parsed.data.status && parsed.data.status !== ticket.status;
    if (statusChanged) {
      await createAuditLog({
        entityType: AUDIT_ENTITY.TICKET,
        entityId: ticket.id,
        action: "ticket_status_changed",
        actorId: session.user.id,
        metadata: { from: ticket.status, to: parsed.data.status },
      });

      if (ticket.user?.email) {
        await notifyTicket({
          to: ticket.user.email,
          subject: `Your support ticket is now ${
            TICKET_STATUS_LABELS[parsed.data.status as TicketStatus]
          }`,
          text: [
            `Hello ${ticket.user.firstName},`,
            "",
            `The status of your support ticket "${ticket.subject}" was updated to ${
              TICKET_STATUS_LABELS[parsed.data.status as TicketStatus]
            }.`,
            "",
            `View it here: ${buildParticipantTicketUrl(ticket.id)}`,
          ].join("\n"),
        });
      }
    }

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
