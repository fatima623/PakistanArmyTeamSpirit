import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { HostFormationAssignSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import {
  AUDIT_ENTITY,
  APPLICATION_STATUS,
  isPaymentVerified,
} from "@/lib/constants";
import { ROLES } from "@/lib/auth-routes";
import { normalizeApplicationStatus } from "@/lib/user-status";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Assign (finalize & mark) or unassign a participant team to a Host Formation.
 * Admin-only. The travel-ready gate is re-verified server-side on assign — the
 * client's disabled button is UX only.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    requireJsonContentType(request);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = HostFormationAssignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        applicationStatus: true,
        paymentStatus: true,
        flightsFinalizedAt: true,
      },
    });
    if (!user) {
      throw new ApiError("Participant not found", 404);
    }

    const { hostFormationId } = parsed.data;

    if (hostFormationId) {
      if (user.role !== ROLES.USER) {
        throw new ApiError(
          "Only participant teams can be assigned to a host formation",
          409
        );
      }

      const travelReady =
        normalizeApplicationStatus(user.applicationStatus) ===
          APPLICATION_STATUS.APPROVED &&
        isPaymentVerified(user.paymentStatus) &&
        user.flightsFinalizedAt != null;
      if (!travelReady) {
        throw new ApiError(
          "Team is not travel-ready — requires approved registration, verified payment, and finalized flight details",
          409
        );
      }

      const formation = await prisma.hostFormation.findUnique({
        where: { id: hostFormationId },
        select: { id: true },
      });
      if (!formation) {
        throw new ApiError("Host formation not found", 404);
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        hostFormationId,
        finalizedForHostAt: hostFormationId ? new Date() : null,
      },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: id,
      action: hostFormationId
        ? "marked_to_host_formation"
        : "unassigned_from_host_formation",
      actorId: session.user.id,
      metadata: { hostFormationId, actorRole: session.user.role },
    });

    revalidatePath("/admin/units");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/admin/host-formations");
    revalidatePath("/host");

    return NextResponse.json({ hostFormationId });
  } catch (error) {
    return handleApiError(error);
  }
}
