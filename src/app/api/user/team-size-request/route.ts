import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import {
  AUDIT_ENTITY,
  TEAM_SIZE_REQUEST_STATUS,
} from "@/lib/constants";
import {
  handleApiError,
  requireAuth,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { TeamSizeRequestSchema } from "@/lib/validations";
import { loadRosterContext } from "@/lib/roster-guard";

const requestSelect = {
  id: true,
  requestedCount: true,
  justification: true,
  status: true,
  reviewNote: true,
  reviewedAt: true,
  createdAt: true,
} as const;

/** The caller's own team-size requests (newest first). */
export async function GET() {
  try {
    const session = await requireAuth();
    const requests = await prisma.teamSizeRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: requestSelect,
    });
    return NextResponse.json({ requests });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Submit a justification to the administrators to increase the team size
 * beyond the current cap.
 */
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = TeamSizeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const ctx = await loadRosterContext(session.user.id);
    if (!ctx.user.teamRegisteredAt) {
      return NextResponse.json(
        { error: "Register your team before requesting additional members" },
        { status: 409 }
      );
    }
    if (parsed.data.requestedCount <= ctx.limit) {
      return NextResponse.json(
        {
          errors: {
            requestedCount: [
              `Your current limit is already ${ctx.limit}. Request a larger team size.`,
            ],
          },
        },
        { status: 400 }
      );
    }

    const pending = await prisma.teamSizeRequest.findFirst({
      where: {
        userId: session.user.id,
        status: TEAM_SIZE_REQUEST_STATUS.PENDING,
      },
      select: { id: true },
    });
    if (pending) {
      return NextResponse.json(
        { error: "You already have a pending request awaiting admin review" },
        { status: 409 }
      );
    }

    const created = await prisma.teamSizeRequest.create({
      data: {
        userId: session.user.id,
        requestedCount: parsed.data.requestedCount,
        justification: parsed.data.justification,
      },
      select: requestSelect,
    });
    await createAuditLog({
      entityType: AUDIT_ENTITY.TEAM_SIZE_REQUEST,
      entityId: created.id,
      action: "team_size_requested",
      actorId: session.user.id,
      metadata: {
        requestedCount: parsed.data.requestedCount,
        currentLimit: ctx.limit,
        actorRole: "user",
      },
    });

    return NextResponse.json({ request: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
