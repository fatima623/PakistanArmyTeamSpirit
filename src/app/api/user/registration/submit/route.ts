import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { APPLICATION_STATUS, AUDIT_ENTITY } from "@/lib/constants";
import {
  ApiError,
  handleApiError,
  requireAuth,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { loadFlightCoverage } from "@/lib/flights";
import {
  areFlightsFinalized,
  isRegistrationApproved,
  isRegistrationDataComplete,
  workflowUserSelect,
} from "@/lib/participant-workflow";

const SubmitSchema = z.object({ submit: z.boolean() });

/**
 * The participant's own "Submit for approval" — the last action of the guided
 * workflow, taken on the Registration Approval step after they have read the
 * whole registration back. Only this puts the record in the SD queue; filling
 * in the individual steps no longer does (see `syncFlightsCompletion`).
 *
 * `submit: false` withdraws it again, so a mistake spotted after submitting can
 * still be corrected — allowed until the SD approves or administration
 * finalizes the flight details.
 */
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = SubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: workflowUserSelect,
    });
    if (!user) throw new ApiError("User not found", 404);

    if (user.suspended) {
      throw new ApiError("Your account is suspended", 403);
    }
    if (isRegistrationApproved(user)) {
      throw new ApiError(
        "Your registration has been approved by PATS and can no longer be changed",
        409
      );
    }
    if (areFlightsFinalized(user)) {
      throw new ApiError(
        "Flight details have been finalized by the administration and are locked",
        409
      );
    }

    const now = new Date();

    if (!parsed.data.submit) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          submittedForApprovalAt: null,
          applicationStatus: APPLICATION_STATUS.PENDING,
        },
      });
      await createAuditLog({
        entityType: AUDIT_ENTITY.USER,
        entityId: session.user.id,
        action: "registration_reopened",
        actorId: session.user.id,
        metadata: { actorRole: "user" },
      });
      revalidatePath("/event/journey");
      revalidatePath("/event/dashboard");
      return NextResponse.json({ submittedForApprovalAt: null });
    }

    /* The stored markers say the steps are done; the live coverage count says
       the documents behind them are still there. Both are checked so a record
       deleted in another tab can't be submitted on a stale page. */
    if (!isRegistrationDataComplete(user)) {
      throw new ApiError(
        "Complete every step of your registration before submitting it for approval",
        409
      );
    }
    const coverage = await loadFlightCoverage(session.user.id);
    if (
      coverage.teamMemberCount === 0 ||
      coverage.membersComplete !== coverage.teamMemberCount
    ) {
      throw new ApiError(
        "Every team member needs a passport and a ticket on file before you can submit",
        409
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        submittedForApprovalAt: now,
        applicationStatus: APPLICATION_STATUS.UNDER_REVIEW,
        // A previous "returned" decision is superseded by this resubmission.
        rejectionReason: null,
      },
    });
    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: session.user.id,
      action: "registration_submitted_for_approval",
      actorId: session.user.id,
      metadata: {
        teamMemberCount: coverage.teamMemberCount,
        actorRole: "user",
      },
    });

    revalidatePath("/event/journey");
    revalidatePath("/event/dashboard");
    return NextResponse.json({ submittedForApprovalAt: now }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
