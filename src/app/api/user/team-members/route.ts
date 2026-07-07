import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { TeamMemberSchema } from "@/lib/validations";
import { teamMemberSelect } from "@/lib/team-members";
import {
  handleApiError,
  requireAuth,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { requireEditableRoster } from "@/lib/roster-guard";

/** List the current participant's own team members. */
export async function GET() {
  try {
    const session = await requireAuth();
    const teamMembers = await prisma.teamMember.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: teamMemberSelect,
    });
    return NextResponse.json({ teamMembers });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Add a team member. Enforces the team-size cap (13 by default, or the
 * admin-approved override) and the roster lock.
 */
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = TeamMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const ctx = await requireEditableRoster(session.user.id);
    if (ctx.memberCount >= ctx.limit) {
      return NextResponse.json(
        {
          error: `Team member limit reached (${ctx.limit}). Use “Request Additional Team Members” to ask the administrators for a larger team.`,
          limitReached: true,
          limit: ctx.limit,
        },
        { status: 409 }
      );
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        userId: session.user.id,
        fullName: parsed.data.fullName,
        serviceNumber: parsed.data.serviceNumber,
        rank: parsed.data.rank,
        serviceArm: parsed.data.serviceArm ?? "",
        gender: parsed.data.gender,
      },
      select: teamMemberSelect,
    });

    return NextResponse.json({ teamMember }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
