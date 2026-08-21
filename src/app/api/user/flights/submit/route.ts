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
import {
  isTeamFlightsComplete,
  loadFlightCoverage,
  requireEditableFlights,
} from "@/lib/flights";
import { isRegistrationApproved } from "@/lib/participant-workflow";

const SubmitSchema = z.object({ submit: z.boolean() });

/**
 * Flight details are the last thing the participant supplies, so submitting
 * them is what sends the whole registration to the SD (Sports Directorate)
 * approval queue. Reopening pulls it back out again — allowed only while the
 * SD has not yet approved and the administration has not finalized.
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

    const ctx = await requireEditableFlights(session.user.id);

    if (isRegistrationApproved(ctx.user)) {
      throw new ApiError(
        "Your registration has been approved by the SD and can no longer be changed",
        409
      );
    }

    const now = new Date();

    if (!parsed.data.submit) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          flightsSubmittedAt: null,
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
      revalidatePath("/event/dashboard");
      revalidatePath("/event/flights");
      return NextResponse.json({ flightsSubmittedAt: null });
    }

    const coverage = await loadFlightCoverage(session.user.id);
    if (!isTeamFlightsComplete(coverage)) {
      throw new ApiError(
        "Every team member needs a passport and a ticket on file before you can submit",
        409
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        flightsSubmittedAt: ctx.user.flightsSubmittedAt ?? now,
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

    revalidatePath("/event/dashboard");
    revalidatePath("/event/flights");
    return NextResponse.json({ flightsSubmittedAt: now }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
