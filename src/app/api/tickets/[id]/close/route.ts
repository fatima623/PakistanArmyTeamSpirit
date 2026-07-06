import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY, TICKET_STATUS } from "@/lib/constants";
import { ApiError, handleApiError, requireAuth } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    if (!ticket || ticket.userId !== session.user.id) {
      throw new ApiError("Ticket not found", 404);
    }
    if (ticket.status === TICKET_STATUS.CLOSED) {
      return NextResponse.json({ ok: true });
    }

    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: TICKET_STATUS.CLOSED, closedAt: new Date() },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.TICKET,
      entityId: ticket.id,
      action: "ticket_closed_by_user",
      actorId: session.user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
