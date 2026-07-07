import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { teamMemberSelect } from "@/lib/team-members";
import { TeamMemberSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  requireAuth,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { requireEditableRoster } from "@/lib/roster-guard";

type RouteContext = { params: Promise<{ id: string }> };

/** Fetch a single team member — only if it belongs to the caller. */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

    const teamMember = await prisma.teamMember.findFirst({
      where: { id, userId: session.user.id },
      select: teamMemberSelect,
    });
    if (!teamMember) {
      throw new ApiError("Team member not found", 404);
    }

    return NextResponse.json({ teamMember });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Edit a team member (inline table editing) — owner only, roster unlocked. */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = TeamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await requireEditableRoster(session.user.id);

    const existing = await prisma.teamMember.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });
    if (!existing) {
      throw new ApiError("Team member not found", 404);
    }

    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: {
        fullName: parsed.data.fullName,
        serviceNumber: parsed.data.serviceNumber,
        rank: parsed.data.rank,
        serviceArm: parsed.data.serviceArm ?? "",
        gender: parsed.data.gender,
      },
      select: teamMemberSelect,
    });

    return NextResponse.json({ teamMember });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Delete a team member — only if it belongs to the caller. */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

    await requireEditableRoster(session.user.id);

    // Scope the delete to the owner so a guessed id can't touch other accounts.
    const result = await prisma.teamMember.deleteMany({
      where: { id, userId: session.user.id },
    });
    if (result.count === 0) {
      throw new ApiError("Team member not found", 404);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
