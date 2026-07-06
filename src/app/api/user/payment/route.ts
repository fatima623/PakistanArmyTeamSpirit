import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY, PAYMENT_STATUS } from "@/lib/constants";
import {
  ApiError,
  handleApiError,
  requireAuth,
} from "@/lib/api-helpers";
import { PaymentSubmitSchema } from "@/lib/validations";
import { getDefaultPaymentAmount, savePaymentProof } from "@/lib/payments";
import { getPaymentSettings } from "@/lib/payment-settings";
import { canSubmitPayment } from "@/lib/user-status";
import { getDeadlines, paymentClosedByDeadline } from "@/lib/deadlines";

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        applicationStatus: true,
        paymentStatus: true,
        suspended: true,
        approved: true,
      },
    });
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const paymentSettings = await getPaymentSettings();
    const deadlines = await getDeadlines();
    const deadlinePassed = paymentClosedByDeadline(deadlines);

    return NextResponse.json({
      user,
      payments,
      paymentSettings,
      defaultAmount: paymentSettings.registrationFee,
      paymentDeadline: deadlines.paymentDeadline,
      deadlinePassed,
      canSubmit:
        !deadlinePassed &&
        canSubmitPayment(
          user.applicationStatus,
          user.paymentStatus,
          user.suspended
        ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    if (user.suspended) {
      throw new ApiError("Account suspended", 403);
    }
    if (
      !canSubmitPayment(
        user.applicationStatus,
        user.paymentStatus,
        user.suspended
      )
    ) {
      throw new ApiError(
        "Payment submission is not available for your account status",
        403
      );
    }

    if (paymentClosedByDeadline(await getDeadlines())) {
      throw new ApiError("The payment deadline has passed.", 403);
    }

    const formData = await request.formData();
    const amount = formData.get("amount");
    const paymentDate = formData.get("paymentDate");
    const transactionReference = formData.get("transactionReference");
    const proof = formData.get("proof");

    const parsed = PaymentSubmitSchema.safeParse({
      amount,
      paymentDate,
      transactionReference,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!proof || !(proof instanceof File) || proof.size === 0) {
      return NextResponse.json(
        { error: "Payment proof file is required" },
        { status: 400 }
      );
    }
    if (proof.size > 5 * 1024 * 1024) {
      throw new ApiError("File must be under 5MB", 400);
    }
    const mime = proof.type || "application/octet-stream";
    const originalFileName =
      typeof proof.name === "string" && proof.name.length > 0
        ? proof.name
        : "payment-proof";

    let proofUpload;
    try {
      const buffer = Buffer.from(await proof.arrayBuffer());
      proofUpload = await savePaymentProof({
      userId: session.user.id,
      uploaderName: `${user.firstName} ${user.lastName}`.trim(),
      uploaderEmail: user.email,
      originalFileName,
      buffer,
      declaredMime: mime,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed";
      throw new ApiError(message, 400);
    }

    const defaultAmount = await getDefaultPaymentAmount();
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: parsed.data.amount || defaultAmount,
        paymentDate: parsed.data.paymentDate,
        transactionReference: parsed.data.transactionReference,
        internalFilePath: proofUpload.internalFilePath,
        proofOriginalFileName: proofUpload.originalFileName,
        proofMimeType: proofUpload.mimeType,
        proofFileSize: proofUpload.fileSize,
        proofUploadedAt: proofUpload.uploadedAt,
        uploaderName: `${user.firstName} ${user.lastName}`.trim(),
        uploaderEmail: user.email,
        status: PAYMENT_STATUS.SUBMITTED,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { paymentStatus: PAYMENT_STATUS.SUBMITTED },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.PAYMENT,
      entityId: payment.id,
      action: "payment_submitted",
      actorId: session.user.id,
      metadata: {
        transactionReference: parsed.data.transactionReference,
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
