import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";
import {
  AdminResetPasswordSchema,
  AdminUserUpdateSchema,
} from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireRegistrationApprover,
  requireStaff,
  requireJsonContentType,
  userSelect,
} from "@/lib/api-helpers";
import { canManageSystem } from "@/lib/auth-routes";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY, APPLICATION_STATUS } from "@/lib/constants";
import { buildApplicationUpdateData } from "@/lib/payments";
import { sendRegistrationApprovedEmail } from "@/lib/participant-status-emails";
import { normalizeApplicationStatus } from "@/lib/user-status";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireStaff();
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
        unit: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { entityType: AUDIT_ENTITY.USER, entityId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json({ user, auditLogs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireRegistrationApprover();
    const isAdmin = canManageSystem(session.user.role);
    requireJsonContentType(request);
    const { id } = await context.params;
    const body = await request.json();

    if (body.newPassword !== undefined) {
      if (!isAdmin) {
        throw new ApiError("Forbidden", 403);
      }
      const parsed = AdminResetPasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        throw new ApiError("User not found", 404);
      }
      const passwordHash = await bcrypt.hash(
        parsed.data.newPassword,
        BCRYPT_ROUNDS
      );
      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });
      await createAuditLog({
        entityType: AUDIT_ENTITY.USER,
        entityId: id,
        action: "password_reset_by_admin",
        actorId: session.user.id,
      });
      return NextResponse.json({ success: true });
    }

    const parsed = AdminUserUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Account management (role changes, suspension, payment status, notes) is
    // reserved for full admins. MTD approvers may only act on the application
    // decision fields.
    const editsProfile =
      parsed.data.firstName !== undefined ||
      parsed.data.lastName !== undefined ||
      parsed.data.email !== undefined ||
      parsed.data.rank !== undefined ||
      parsed.data.gender !== undefined;

    if (
      !isAdmin &&
      (parsed.data.role !== undefined ||
        parsed.data.suspended !== undefined ||
        parsed.data.paymentStatus !== undefined ||
        parsed.data.adminNotes !== undefined ||
        editsProfile)
    ) {
      throw new ApiError(
        "Only administrators can change account details, roles, suspension, payment status, or notes",
        403
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("User not found", 404);
    }

    if (parsed.data.email !== undefined) {
      const nextEmail = parsed.data.email.toLowerCase().trim();
      if (nextEmail !== existing.email) {
        const clash = await prisma.user.findUnique({
          where: { email: nextEmail },
        });
        if (clash && clash.id !== id) {
          throw new ApiError("A user with this email already exists", 409);
        }
      }
    }

    const wasApproved =
      existing.approved ||
      normalizeApplicationStatus(existing.applicationStatus) ===
        APPLICATION_STATUS.APPROVED;

    const data: Record<string, unknown> = {};

    if (parsed.data.firstName !== undefined) {
      data.firstName = parsed.data.firstName.trim();
    }
    if (parsed.data.lastName !== undefined) {
      data.lastName = parsed.data.lastName.trim();
    }
    if (parsed.data.email !== undefined) {
      data.email = parsed.data.email.toLowerCase().trim();
    }
    if (parsed.data.rank !== undefined) data.rank = parsed.data.rank.trim();
    if (parsed.data.gender !== undefined) data.gender = parsed.data.gender;
    if (parsed.data.role !== undefined) data.role = parsed.data.role;
    if (parsed.data.adminNotes !== undefined) {
      data.adminNotes = parsed.data.adminNotes;
    }
    if (parsed.data.suspended !== undefined) {
      data.suspended = parsed.data.suspended;
    }
    if (parsed.data.paymentStatus !== undefined) {
      data.paymentStatus = parsed.data.paymentStatus;
    }

    if (parsed.data.applicationStatus !== undefined) {
      Object.assign(
        data,
        buildApplicationUpdateData(
          parsed.data.applicationStatus,
          parsed.data.rejectionReason
        )
      );
    } else if (parsed.data.approved !== undefined) {
      data.approved = parsed.data.approved;
      if (parsed.data.approved) {
        data.applicationStatus = APPLICATION_STATUS.APPROVED;
        data.approvedAt = new Date();
        data.rejectedAt = null;
        data.rejectionReason = null;
      } else if (existing.applicationStatus === APPLICATION_STATUS.APPROVED) {
        data.applicationStatus = APPLICATION_STATUS.PENDING;
        data.approvedAt = null;
      }
    }

    if (
      parsed.data.rejectionReason !== undefined &&
      parsed.data.applicationStatus === undefined
    ) {
      data.rejectionReason = parsed.data.rejectionReason;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        ...userSelect,
        unit: true,
      },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: id,
      action: "application_updated",
      actorId: session.user.id,
      metadata: parsed.data,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/event/dashboard");

    const newlyApproved =
      !wasApproved &&
      (user.approved ||
        normalizeApplicationStatus(user.applicationStatus) ===
          APPLICATION_STATUS.APPROVED);

    if (newlyApproved) {
      try {
        await sendRegistrationApprovedEmail({
          email: user.email,
          firstName: user.firstName,
        });
      } catch (emailError) {
        console.error(
          "[admin/users] Failed to send registration approved email",
          { userId: id, emailError }
        );
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;

    if (id === session.user.id) {
      throw new ApiError("Cannot delete your own account", 400);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("User not found", 404);
    }

    await prisma.user.delete({ where: { id } });

    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: id,
      action: "user_deleted",
      actorId: session.user.id,
      metadata: { email: existing.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
