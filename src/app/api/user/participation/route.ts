import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY } from "@/lib/constants";
import {
  ApiError,
  handleApiError,
  requireAuth,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { ParticipationActionSchema } from "@/lib/validations";
import { getWorkflowSettings } from "@/lib/workflow-settings";
import { isConfirmationDeadlinePassed } from "@/lib/participant-workflow";

/** Current participation confirmation state + deadline (own account). */
export async function GET() {
  try {
    const session = await requireAuth();
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          participationConfirmedAt: true,
          participationDeclinedAt: true,
        },
      }),
      getWorkflowSettings(),
    ]);
    if (!user) throw new ApiError("User not found", 404);

    return NextResponse.json({
      participationConfirmedAt: user.participationConfirmedAt,
      participationDeclinedAt: user.participationDeclinedAt,
      deadline: settings.participationConfirmDeadline,
      expired: isConfirmationDeadlinePassed(settings),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * First-login availability decision.
 *  - confirm → grants portal access (blocked once the deadline has passed)
 *  - decline → recorded; the client signs the participant out to the login
 *    page. They may return and confirm any time before the deadline.
 */
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = ParticipationActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { participationConfirmedAt: true, suspended: true },
    });
    if (!user) throw new ApiError("User not found", 404);
    if (user.suspended) throw new ApiError("Account suspended", 403);

    const settings = await getWorkflowSettings();

    if (parsed.data.action === "confirm") {
      if (user.participationConfirmedAt) {
        return NextResponse.json({
          participationConfirmedAt: user.participationConfirmedAt,
        });
      }
      if (isConfirmationDeadlinePassed(settings)) {
        throw new ApiError(
          "The registration confirmation deadline has passed. Confirmation is no longer possible — please contact the organizers.",
          403
        );
      }
      const now = new Date();
      await prisma.user.update({
        where: { id: session.user.id },
        data: { participationConfirmedAt: now, participationDeclinedAt: null },
      });
      await createAuditLog({
        entityType: AUDIT_ENTITY.USER,
        entityId: session.user.id,
        action: "participation_confirmed",
        actorId: session.user.id,
        metadata: { actorRole: "user" },
      });
      revalidatePath("/event/dashboard");
      return NextResponse.json({ participationConfirmedAt: now });
    }

    // decline
    const now = new Date();
    await prisma.user.update({
      where: { id: session.user.id },
      data: { participationDeclinedAt: now },
    });
    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: session.user.id,
      action: "participation_declined",
      actorId: session.user.id,
      metadata: { actorRole: "user" },
    });
    return NextResponse.json({ participationDeclinedAt: now });
  } catch (error) {
    return handleApiError(error);
  }
}
