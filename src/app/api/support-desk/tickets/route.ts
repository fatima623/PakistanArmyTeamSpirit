import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handleApiError, requireAdmin } from "@/lib/api-helpers";
import { normalizeTicketStatus, TICKET_STATUS } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const search = searchParams.get("q")?.trim();

    const where: Prisma.SupportTicketWhereInput = {};
    if (statusParam && statusParam !== "all") {
      where.status = normalizeTicketStatus(statusParam);
    }
    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
      ];
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: [{ status: "asc" }, { lastReplyAt: "desc" }],
      select: {
        id: true,
        subject: true,
        category: true,
        status: true,
        priority: true,
        lastReplyAt: true,
        createdAt: true,
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        assignedTo: {
          select: { firstName: true, lastName: true },
        },
        _count: { select: { messages: true } },
      },
    });

    const counts = await prisma.supportTicket.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const statusCounts: Record<string, number> = {
      all: 0,
      [TICKET_STATUS.OPEN]: 0,
      [TICKET_STATUS.IN_PROGRESS]: 0,
      [TICKET_STATUS.RESOLVED]: 0,
      [TICKET_STATUS.CLOSED]: 0,
    };
    for (const row of counts) {
      statusCounts[row.status] = row._count._all;
      statusCounts.all += row._count._all;
    }

    return NextResponse.json({ tickets, statusCounts });
  } catch (error) {
    return handleApiError(error);
  }
}
