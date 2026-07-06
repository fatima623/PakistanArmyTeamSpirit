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
  applicationStatus: "PENDING" | "APPROVED" | "REJECTED",
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
