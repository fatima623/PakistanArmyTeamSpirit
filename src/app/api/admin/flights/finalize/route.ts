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
import { AdminFlightFinalizeSchema } from "@/lib/validations";

/**
 * Finalize (lock) or unlock a participant's flight details — Admin only.
 * Finalizing makes records read-only for the participant and reveals the
 * Host Information section (once published).
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

    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, flightsFinalizedAt: true },
    });
    if (!user) throw new ApiError("Participant not found", 404);

    const flightsFinalizedAt = parsed.data.finalized ? new Date() : null;
    await prisma.user.update({
      where: { id: user.id },
      data: { flightsFinalizedAt },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: user.id,
      action: parsed.data.finalized
        ? "flight_details_finalized"
        : "flight_details_unlocked",
      actorId: session.user.id,
      metadata: { actorRole: session.user.role },
    });

    revalidatePath("/admin/flights");
    revalidatePath("/event/flights");
    revalidatePath("/event/dashboard");
    revalidatePath("/event/host-info");
    return NextResponse.json({ flightsFinalizedAt });
  } catch (error) {
    return handleApiError(error);
  }
}
