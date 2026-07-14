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
import { deleteFlightDocByInternalPath } from "@/lib/storage/flight-doc";

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

    // Scope the lookup to the owner so a guessed id can't touch other accounts.
    const member = await prisma.teamMember.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        flightDetail: {
          select: { id: true, passportFilePath: true, ticketFilePath: true },
        },
      },
    });
    if (!member) {
      throw new ApiError("Team member not found", 404);
    }

    // The member's flight record goes with them (FK onDelete: Cascade).
    await prisma.teamMember.delete({ where: { id: member.id } });

    // Unlink their stored PDFs only AFTER the DB commit, so a failed delete
    // never destroys files that are still referenced. Best-effort.
    if (member.flightDetail) {
      await deleteFlightDocByInternalPath(member.flightDetail.passportFilePath);
      await deleteFlightDocByInternalPath(member.flightDetail.ticketFilePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
