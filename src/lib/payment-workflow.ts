import {
  PAYMENT_STATUS,
  type PaymentStatus,
  normalizePaymentStatus,
} from "@/lib/constants";

/** Detail-page dropdown order (Payment Verification review panel) */
export const PAYMENT_DETAIL_DROPDOWN_OPTIONS: PaymentStatus[] = [
  PAYMENT_STATUS.PENDING,
  PAYMENT_STATUS.SUBMITTED,
  PAYMENT_STATUS.UNDER_REVIEW,
  PAYMENT_STATUS.VERIFIED,
  PAYMENT_STATUS.REJECTED,
  PAYMENT_STATUS.RETURNED,
];

export function paymentDetailStatusHint(status: string): string | null {
  const key = normalizePaymentStatus(status);

  switch (key) {
    case PAYMENT_STATUS.PENDING:
      return "Waiting for the participant to pay and upload proof.";
    case PAYMENT_STATUS.SUBMITTED:
      return "Payment proof submitted by the participant — awaiting your review.";
    case PAYMENT_STATUS.UNDER_REVIEW:
      return "You are currently reviewing this payment proof.";
    case PAYMENT_STATUS.VERIFIED:
      return "Payment has been verified. No further action needed.";
    case PAYMENT_STATUS.REJECTED:
      return "Proof was rejected. Change status to Payment Submitted once the participant resubmits.";
    case PAYMENT_STATUS.RETURNED:
      return "Returned for correction. Change status to Payment Submitted once the participant resubmits corrected proof.";
    default:
      return null;
  }
}

export function dropdownStatusValue(status: PaymentStatus): PaymentStatus {
  if (PAYMENT_DETAIL_DROPDOWN_OPTIONS.includes(status)) return status;
  return PAYMENT_STATUS.PENDING;
}
