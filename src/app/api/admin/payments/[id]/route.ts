import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import {
  AUDIT_ENTITY,
  PAYMENT_STATUS,
  normalizePaymentStatus,
} from "@/lib/constants";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { AdminPaymentUpdateSchema } from "@/lib/validations";
import {
  buildPaymentStatusUpdateData,
  requiresPaymentRejectionReasonForUpdate,
} from "@/lib/payment-status-update";
import { sendPaymentConfirmedEmail } from "@/lib/participant-status-emails";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            country: true,
            nationality: true,
            applicationStatus: true,
            paymentStatus: true,
            unit: true,
          },
        },
        verifiedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!payment) {
      throw new ApiError("Payment not found", 404);
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { entityType: AUDIT_ENTITY.PAYMENT, entityId: id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        actor: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({ payment, auditLogs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const session = await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = AdminPaymentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Payment not found", 404);
    }

    const status = normalizePaymentStatus(parsed.data.status);
    const existingNormalized = normalizePaymentStatus(existing.status);
    const statusChanged = status !== existingNormalized;

    if (
      requiresPaymentRejectionReasonForUpdate(
        status,
        existingNormalized,
        statusChanged
      ) &&
      !parsed.data.rejectionReason?.trim()
    ) {
      return NextResponse.json(
        {
          errors: {
            rejectionReason: ["A reason is required for the participant"],
          },
        },
        { status: 400 }
      );
    }

    const { data: updateData } = buildPaymentStatusUpdateData({
      existing,
      status,
      adminNotes: parsed.data.adminNotes,
      rejectionReason: parsed.data.rejectionReason,
      verifiedById: session.user.id,
    });

    const isReject = status === PAYMENT_STATUS.REJECTED;
    const isReturned = status === PAYMENT_STATUS.RETURNED;

    const payment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id },
        data: updateData,
      });

      if (
        statusChanged &&
        (isReject || isReturned) &&
        updateData.rejectionReason
      ) {
        await tx.paymentRejectionHistory.create({
          data: {
            paymentId: id,
            type: status,
            reason: updateData.rejectionReason,
          },
        });
      }

      await tx.user.update({
        where: { id: existing.userId },
        data: { paymentStatus: status },
      });

      return updated;
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.PAYMENT,
      entityId: id,
      action: `payment_status_${status.toLowerCase()}`,
      actorId: session.user.id,
      metadata:
        isReject || isReturned
          ? { status, rejectionReason: updateData.rejectionReason }
          : { status, previousStatus: existingNormalized },
    });

    revalidatePath("/admin/payments");
    revalidatePath(`/admin/payments/${id}`);
    revalidatePath("/event/dashboard");
    revalidatePath("/event/payment");

    if (statusChanged && status === PAYMENT_STATUS.VERIFIED) {
      try {
        const participant = await prisma.user.findUnique({
          where: { id: existing.userId },
          select: { email: true, firstName: true },
        });
        if (participant) {
          await sendPaymentConfirmedEmail(participant);
        }
      } catch (emailError) {
        console.error(
          "[admin/payments] Failed to send payment confirmed email",
          { paymentId: id, userId: existing.userId, emailError }
        );
      }
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("[admin/payments PUT] Failed to update payment status", {
      paymentId: id,
      error,
    });
    return handleApiError(error);
  }
}
