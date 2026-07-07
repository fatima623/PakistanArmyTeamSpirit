import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { handleApiError, requireStaff } from "@/lib/api-helpers";

/** Team-size requests queue — visible to all staff. */
export async function GET(request: Request) {
  try {
    await requireStaff();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Prisma.TeamSizeRequestWhereInput = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const requests = await prisma.teamSizeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            maxTeamMembersOverride: true,
            unit: { select: { unitName: true } },
            _count: { select: { teamMembers: true } },
          },
        },
        reviewedBy: {
          select: { firstName: true, lastName: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    return handleApiError(error);
  }
}
