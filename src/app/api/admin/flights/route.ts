import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { handleApiError, requireStaff } from "@/lib/api-helpers";
import { flightDetailSelect } from "@/lib/flights";

/**
 * Flight submissions grouped by participant — staff review view.
 * Participants appear once their roster is complete or they have records.
 */
export async function GET() {
  try {
    await requireStaff();

    const users = await prisma.user.findMany({
      where: {
        role: "user",
        OR: [
          { rosterCompletedAt: { not: null } },
          { flightDetails: { some: {} } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 300,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        rosterCompletedAt: true,
        flightsFinalizedAt: true,
        unit: { select: { unitName: true } },
        _count: { select: { teamMembers: true } },
        flightDetails: {
          orderBy: { createdAt: "asc" },
          select: flightDetailSelect,
        },
      },
    });

    return NextResponse.json({ participants: users });
  } catch (error) {
    return handleApiError(error);
  }
}
