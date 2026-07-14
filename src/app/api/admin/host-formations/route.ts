import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { HostFormationCreateSchema } from "@/lib/validations";
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
  PAYMENT_STATUS,
} from "@/lib/constants";
import { BCRYPT_ROUNDS } from "@/lib/password-policy";
import { ROLES } from "@/lib/auth-routes";

/** Fields returned to the admin manager for a single formation row. */
const formationListSelect = {
  id: true,
  name: true,
  notes: true,
  createdAt: true,
  hostUser: { select: { email: true, firstName: true, lastName: true } },
  _count: { select: { members: true } },
} as const;

export async function GET() {
  try {
    await requireAdmin();

    const formations = await prisma.hostFormation.findMany({
      orderBy: { createdAt: "desc" },
      select: formationListSelect,
    });

    return NextResponse.json({ formations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = HostFormationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      throw new ApiError("A user with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
    const now = new Date();
    const notes = parsed.data.notes?.trim() ? parsed.data.notes.trim() : null;

    // Create the host login account and the formation atomically. The account
    // is provisioned as a ready-to-use login (approved/verified/email-confirmed)
    // because `host` is NOT a staff role, so the generic create-user recipe
    // would leave it PENDING/unapproved.
    const formation = await prisma.$transaction(async (tx) => {
      const hostUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          rank: "—",
          gender: "Other",
          role: ROLES.HOST,
          approved: true,
          applicationStatus: APPLICATION_STATUS.APPROVED,
          paymentStatus: PAYMENT_STATUS.VERIFIED,
          emailVerifiedAt: now,
          privacyAccepted: true,
          privacyAcceptedAt: now,
        },
        select: { id: true },
      });

      return tx.hostFormation.create({
        data: { name: parsed.data.name, notes, hostUserId: hostUser.id },
        select: formationListSelect,
      });
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.HOST_FORMATION,
      entityId: formation.id,
      action: "host_formation_created",
      actorId: session.user.id,
      metadata: { name: formation.name, hostEmail: email },
    });

    revalidatePath("/admin/host-formations");

    return NextResponse.json({ formation }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
