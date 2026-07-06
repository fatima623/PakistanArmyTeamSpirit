import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requireAuth } from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

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
