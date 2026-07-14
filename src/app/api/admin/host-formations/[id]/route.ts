import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { HostFormationUpdateSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY } from "@/lib/constants";

type RouteContext = { params: Promise<{ id: string }> };

const formationListSelect = {
  id: true,
  name: true,
  notes: true,
  createdAt: true,
  hostUser: { select: { email: true, firstName: true, lastName: true } },
  _count: { select: { members: true } },
} as const;

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    requireJsonContentType(request);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = HostFormationUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.hostFormation.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new ApiError("Host formation not found", 404);
    }

    const notes = parsed.data.notes?.trim() ? parsed.data.notes.trim() : null;
    const formation = await prisma.hostFormation.update({
      where: { id },
      data: { name: parsed.data.name, notes },
      select: formationListSelect,
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.HOST_FORMATION,
      entityId: id,
      action: "host_formation_updated",
      actorId: session.user.id,
      metadata: { name: parsed.data.name },
    });

    revalidatePath("/admin/host-formations");
    revalidatePath("/host");

    return NextResponse.json({ formation });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.hostFormation.findUnique({
      where: { id },
      select: { id: true, name: true, hostUserId: true },
    });
    if (!existing) {
      throw new ApiError("Host formation not found", 404);
    }

    // Clear the finalized stamp on assigned teams, then delete the host login
    // account — which cascade-deletes the formation and (SetNull) detaches its
    // members' hostFormationId. Both run in one transaction.
    await prisma.$transaction([
      prisma.user.updateMany({
        where: { hostFormationId: id },
        data: { finalizedForHostAt: null },
      }),
      prisma.user.delete({ where: { id: existing.hostUserId } }),
    ]);

    await createAuditLog({
      entityType: AUDIT_ENTITY.HOST_FORMATION,
      entityId: id,
      action: "host_formation_deleted",
      actorId: session.user.id,
      metadata: { name: existing.name },
    });

    revalidatePath("/admin/host-formations");
    revalidatePath("/admin/users");
    revalidatePath("/host");

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
