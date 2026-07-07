import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY } from "@/lib/constants";
import { ApiError, handleApiError, requireAuth } from "@/lib/api-helpers";
import {
  canRegisterTeam,
  getTeamRegistrationWindowState,
  hasConfirmedParticipation,
  isPaymentComplete,
  isRegistrationApproved,
  workflowUserSelect,
} from "@/lib/participant-workflow";
import { getWorkflowSettings } from "@/lib/workflow-settings";

/**
 * Register the participant's team. Allowed only inside the admin-configured
 * team registration window, after participation confirmation, SD registration
 * verification, and MT payment verification.
 */
export async function POST() {
  try {
    const session = await requireAuth();
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { ...workflowUserSelect, unit: { select: { unitName: true } } },
      }),
      getWorkflowSettings(),
    ]);
    if (!user) throw new ApiError("User not found", 404);

    if (user.teamRegisteredAt) {
      return NextResponse.json({ teamRegisteredAt: user.teamRegisteredAt });
    }

    if (!canRegisterTeam(user, settings)) {
      if (!hasConfirmedParticipation(user)) {
        throw new ApiError("Confirm your participation first", 409);
      }
      if (!isRegistrationApproved(user)) {
        throw new ApiError(
          "Your registration must be verified by the SD before team registration",
          409
        );
      }
      if (!isPaymentComplete(user)) {
        throw new ApiError(
          "Your payment must be verified by the MT before team registration",
          409
        );
      }
      const windowState = getTeamRegistrationWindowState(settings);
      if (windowState === "before") {
        throw new ApiError("Team registration has not opened yet", 409);
      }
      if (windowState === "closed") {
        throw new ApiError("The team registration period has closed", 409);
      }
      throw new ApiError("Team registration is not available", 409);
    }

    const now = new Date();
    await prisma.user.update({
      where: { id: session.user.id },
      data: { teamRegisteredAt: now },
    });
    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: session.user.id,
      action: "team_registered",
      actorId: session.user.id,
      metadata: { unitName: user.unit?.unitName ?? null, actorRole: "user" },
    });

    revalidatePath("/event/dashboard");
    revalidatePath("/event/team");
    return NextResponse.json({ teamRegisteredAt: now }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
