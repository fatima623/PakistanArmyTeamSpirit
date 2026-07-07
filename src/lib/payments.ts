import { PAYMENT_STATUS, APPLICATION_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  savePaymentProofInternal,
  type PaymentProofUploadInput,
  type PaymentProofUploadResult,
} from "@/lib/storage/payment-proof";

export { isAllowedProofMime } from "@/lib/storage/payment-proof";

export async function savePaymentProof(
  input: PaymentProofUploadInput
): Promise<PaymentProofUploadResult> {
  return savePaymentProofInternal(input);
}

export async function syncUserPaymentStatusFromLatestPayment(userId: string) {
  const latest = await prisma.payment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return;
  await prisma.user.update({
    where: { id: userId },
    data: { paymentStatus: latest.status },
  });
}

export function buildApplicationUpdateData(
  applicationStatus:
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "RETURNED",
  rejectionReason?: string | null
) {
  const now = new Date();
  if (applicationStatus === APPLICATION_STATUS.APPROVED) {
    return {
      applicationStatus,
      approved: true,
      approvedAt: now,
      rejectedAt: null,
      rejectionReason: null,
    };
  }
  if (applicationStatus === APPLICATION_STATUS.REJECTED) {
    return {
      applicationStatus,
      approved: false,
      approvedAt: null,
      rejectedAt: now,
      rejectionReason: rejectionReason ?? null,
    };
  }
  if (applicationStatus === APPLICATION_STATUS.RETURNED) {
    // Returned for correction: not a terminal rejection — keep the reason so
    // the participant knows what to fix, but do not stamp rejectedAt.
    return {
      applicationStatus,
      approved: false,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: rejectionReason ?? null,
    };
  }
  return {
    applicationStatus,
    approved: false,
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
  };
}

export async function getDefaultPaymentAmount() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { defaultPaymentAmount: true },
  });
  return settings?.defaultPaymentAmount ?? 15000;
}

export { PAYMENT_STATUS };
