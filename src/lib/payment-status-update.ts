import {
  PAYMENT_STATUS,
  isPaymentVerified,
  normalizePaymentStatus,
  type PaymentStatus,
} from "@/lib/constants";

type PaymentRecord = {
  status: string;
  adminNotes: string | null;
  rejectionReason: string | null;
};

export function requiresPaymentRejectionReasonForUpdate(
  nextStatus: PaymentStatus,
  existingStatus: PaymentStatus,
  statusChanged: boolean
): boolean {
  const needsReason =
    nextStatus === PAYMENT_STATUS.REJECTED ||
    nextStatus === PAYMENT_STATUS.RETURNED;
  return needsReason && statusChanged && nextStatus !== existingStatus;
}

export function resolvePaymentRejectionReason(params: {
  nextStatus: PaymentStatus;
  existingStatus: PaymentStatus;
  existingReason: string | null;
  incomingReason: string | null | undefined;
  statusChanged: boolean;
}): string | null {
  const {
    nextStatus,
    existingReason,
    incomingReason,
    statusChanged,
  } = params;

  const isRejectOrReturn =
    nextStatus === PAYMENT_STATUS.REJECTED ||
    nextStatus === PAYMENT_STATUS.RETURNED;

  if (isRejectOrReturn) {
    const trimmed = incomingReason?.trim();
    if (trimmed) return trimmed;
    if (!statusChanged) return existingReason;
    return null;
  }

  if (!statusChanged) return existingReason;
  return existingReason;
}

export function buildPaymentStatusUpdateData(params: {
  existing: PaymentRecord;
  status: PaymentStatus;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  verifiedById: string | null;
}) {
  const { existing, status, adminNotes, rejectionReason, verifiedById } =
    params;

  const existingNormalized = normalizePaymentStatus(existing.status);
  const statusChanged = status !== existingNormalized;
  const isVerify = isPaymentVerified(status);

  const resolvedRejectionReason = resolvePaymentRejectionReason({
    nextStatus: status,
    existingStatus: existingNormalized,
    existingReason: existing.rejectionReason,
    incomingReason: rejectionReason,
    statusChanged,
  });

  return {
    statusChanged,
    data: {
      status,
      adminNotes: adminNotes ?? existing.adminNotes,
      rejectionReason: resolvedRejectionReason,
      verifiedById: isVerify ? verifiedById : null,
      verifiedAt: isVerify ? new Date() : null,
    },
  };
}
