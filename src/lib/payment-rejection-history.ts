import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  isPaymentVerified,
  normalizePaymentStatus,
} from "@/lib/constants";

export type PaymentRejectionHistoryEntry = {
  id: string;
  type: string;
  reason: string;
  createdAt: string;
};

export function serializeRejectionHistory(
  rows: { id: string; type: string; reason: string; createdAt: Date }[]
): PaymentRejectionHistoryEntry[] {
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
  }));
}

export function rejectionHistoryTypeLabel(type: string): string {
  const normalized = normalizePaymentStatus(type);
  if (
    normalized === PAYMENT_STATUS.REJECTED ||
    normalized === PAYMENT_STATUS.RETURNED
  ) {
    return PAYMENT_STATUS_LABELS[normalized];
  }
  return type;
}

export function shouldShowPaymentStatusTimeline(
  status: string,
  history: PaymentRejectionHistoryEntry[]
): boolean {
  if (isPaymentVerified(status)) return false;
  return history.length > 0;
}
