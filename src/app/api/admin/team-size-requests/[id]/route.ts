import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import {
  AUDIT_ENTITY,
  TEAM_SIZE_REQUEST_STATUS,
} from "@/lib/constants";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { AdminTeamSizeReviewSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Decide a team-size request — Admin only. Approval raises the participant's
 * member cap to the requested count.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    requireJsonContentType(request);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = AdminTeamSizeReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.teamSizeRequest.findUnique({
      where: { id },
      select: { id: true, userId: true, requestedCount: true, status: true },
    });
    if (!existing) throw new ApiError("Request not found", 404);
    if (existing.status !== TEAM_SIZE_REQUEST_STATUS.PENDING) {
      throw new ApiError("This request has already been decided", 409);
    }

    const approved = parsed.data.status === TEAM_SIZE_REQUEST_STATUS.APPROVED;

    const updated = await prisma.$transaction(async (tx) => {
      const req = await tx.teamSizeRequest.update({
        where: { id },
        data: {
          status: parsed.data.status,
          reviewNote: parsed.data.reviewNote?.trim() || null,
          reviewedById: session.user.id,
          reviewedAt: new Date(),
        },
      });
      if (approved) {
        await tx.user.update({
          where: { id: existing.userId },
          data: { maxTeamMembersOverride: existing.requestedCount },
        });
      }
      return req;
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.TEAM_SIZE_REQUEST,
      entityId: id,
      action: approved ? "team_size_request_approved" : "team_size_request_rejected",
      actorId: session.user.id,
      metadata: {
        userId: existing.userId,
        requestedCount: existing.requestedCount,
        reviewNote: parsed.data.reviewNote ?? null,
        actorRole: session.user.role,
      },
    });

    revalidatePath("/admin/team-requests");
    revalidatePath("/event/team");
    return NextResponse.json({ request: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
