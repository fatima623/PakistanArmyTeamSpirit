import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY } from "@/lib/constants";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { isFlightRecordComplete } from "@/lib/flights";
import { AdminFlightFinalizeSchema } from "@/lib/validations";

/**
 * Finalize (lock) or unlock a participant's flight details — Admin only.
 * Finalizing makes records read-only for the participant, feeds the host
 * dashboard and the host-formation travel-ready gate, and reveals the Host
 * Information section (once published).
 *
 * Finalizing is gated on completeness: EVERY roster member must have a flight
 * record with BOTH a passport and a ticket on file (see isFlightRecordComplete)
 * — otherwise a team could be locked with zero documents. `force: true` lets the
 * Administrator override that deliberately; the override is audited.
 */
export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = AdminFlightFinalizeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, finalized, force = false } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        flightsFinalizedAt: true,
        teamMembers: {
          select: {
            id: true,
            flightDetail: {
              select: { passportFilePath: true, ticketFilePath: true },
            },
          },
        },
      },
    });
    if (!user) throw new ApiError("Participant not found", 404);

    // Coverage is always counted from the TeamMember side — counting flight
    // rows would let a legacy orphan (teamMemberId = null) stand in for a
    // traveller who submitted nothing.
    const memberCount = user.teamMembers.length;
    const completeCount = user.teamMembers.filter((m) =>
      isFlightRecordComplete(m.flightDetail)
    ).length;

    /* The single gate condition — reused for BOTH the 409 and the audit's
       `forced` flag, so the flag can never drift from the branch it describes
       (an empty roster is a gate failure too, and was previously audited as
       forced: false because `completeCount < memberCount` is 0 < 0). */
    const gateFailed = memberCount === 0 || completeCount < memberCount;

    if (finalized && !force && gateFailed) {
      if (memberCount === 0) {
        throw new ApiError(
          "This team has no travellers on its roster — there is nothing to finalize",
          409
        );
      }
      const missing = memberCount - completeCount;
      throw new ApiError(
        `${missing} of ${memberCount} traveller${memberCount === 1 ? "" : "s"} still need a passport and ticket`,
        409
      );
    }

    const flightsFinalizedAt = finalized ? new Date() : null;
    await prisma.user.update({
      where: { id: user.id },
      data: { flightsFinalizedAt },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: user.id,
      action: finalized ? "flight_details_finalized" : "flight_details_unlocked",
      actorId: session.user.id,
      metadata: {
        actorRole: session.user.role,
        memberCount,
        completeCount,
        forced: finalized && !!force && gateFailed,
      },
    });

    revalidatePath("/admin/flights");
    revalidatePath("/admin/host-formations");
    revalidatePath("/admin/users");
    revalidatePath("/host");
    revalidatePath("/event/flights");
    revalidatePath("/event/dashboard");
    revalidatePath("/event/host-info");
    return NextResponse.json({ flightsFinalizedAt });
  } catch (error) {
    return handleApiError(error);
  }
}
