import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY, TICKET_STATUS } from "@/lib/constants";
import { ApiError, handleApiError, requireAuth } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

/** Statuses a participant may set on their own ticket from the support list. */
const OWNER_SETTABLE_STATUSES = [
  TICKET_STATUS.OPEN,
  TICKET_STATUS.RESOLVED,
  TICKET_STATUS.CLOSED,
] as const;

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        subject: true,
        category: true,
        status: true,
        priority: true,
        createdAt: true,
        lastReplyAt: true,
        closedAt: true,
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

    if (!ticket || ticket.userId !== session.user.id) {
      throw new ApiError("Ticket not found", 404);
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = (await request.json().catch(() => ({}))) as {
      status?: string;
    };
    const status = body.status;
    if (
      !status ||
      !OWNER_SETTABLE_STATUSES.includes(
        status as (typeof OWNER_SETTABLE_STATUSES)[number]
      )
    ) {
      throw new ApiError("Invalid status", 400);
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    if (!ticket || ticket.userId !== session.user.id) {
      throw new ApiError("Ticket not found", 404);
    }

    if (ticket.status !== status) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status,
          closedAt: status === TICKET_STATUS.CLOSED ? new Date() : null,
        },
      });

      await createAuditLog({
        entityType: AUDIT_ENTITY.TICKET,
        entityId: ticket.id,
        action: `ticket_${status.toLowerCase()}_by_user`,
        actorId: session.user.id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
