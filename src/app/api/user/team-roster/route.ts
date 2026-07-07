import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY } from "@/lib/constants";
import {
  handleApiError,
  requireAuth,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { requireEditableRoster } from "@/lib/roster-guard";

const RosterCompleteSchema = z.object({ complete: z.boolean() });

/**
 * Mark the team-member roster as complete (unlocks Flight Details), or
 * reopen it while records are not yet finalized by the administration.
 */
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = RosterCompleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const ctx = await requireEditableRoster(session.user.id);

    if (parsed.data.complete && ctx.memberCount === 0) {
      return NextResponse.json(
        { error: "Add at least one team member before completing the roster" },
        { status: 409 }
      );
    }

    const rosterCompletedAt = parsed.data.complete ? new Date() : null;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { rosterCompletedAt },
    });
    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: session.user.id,
      action: parsed.data.complete ? "roster_completed" : "roster_reopened",
      actorId: session.user.id,
      metadata: { memberCount: ctx.memberCount, actorRole: "user" },
    });

    revalidatePath("/event/dashboard");
    revalidatePath("/event/team");
    revalidatePath("/event/flights");
    return NextResponse.json({ rosterCompletedAt });
  } catch (error) {
    return handleApiError(error);
  }
}
