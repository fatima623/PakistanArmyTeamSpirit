import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { teamMemberSelect } from "@/lib/team-members";
import { ApiError, handleApiError, requireAuth } from "@/lib/api-helpers";

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

/** Delete a team member — only if it belongs to the caller. */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

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
