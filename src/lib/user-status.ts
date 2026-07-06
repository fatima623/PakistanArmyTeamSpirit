import {
  APPLICATION_STATUS,
  PAYMENT_STATUS,
  canResubmitPayment,
  isPaymentAwaitingVerification,
  isPaymentVerified,
  normalizePaymentStatus,
} from "@/lib/constants";
import type { ApplicationStatus, PaymentStatus } from "@/lib/constants";

export function isApplicationApproved(status: string): boolean {
  return status === APPLICATION_STATUS.APPROVED;
}

export function canSubmitPayment(
  applicationStatus: string,
  paymentStatus: string,
  suspended: boolean
): boolean {
  if (suspended) return false;
  if (!isApplicationApproved(applicationStatus)) return false;
  return canResubmitPayment(paymentStatus);
}

export function applicationStatusSummary(applicationStatus: string): string {
  if (applicationStatus === APPLICATION_STATUS.REJECTED) {
    return "Your participation request was returned for correction by authorized staff.";
  }
  if (applicationStatus === APPLICATION_STATUS.PENDING) {
    return "Your registration is pending review by PATS. Payment opens after approval.";
  }
  return "Your application is approved. Complete payment verification below.";
}

export function paymentStatusSummary(paymentStatus: string): string {
  const status = normalizePaymentStatus(paymentStatus);
  if (status === PAYMENT_STATUS.VERIFIED) {
    return "Payment verified. No further payment action required.";
  }
  if (status === PAYMENT_STATUS.SUBMITTED) {
    return "Payment proof uploaded. An admin must review your proof before it is verified.";
  }
  if (status === PAYMENT_STATUS.UNDER_REVIEW) {
    return "Your payment proof is under review by PATS staff.";
  }
  if (status === PAYMENT_STATUS.REJECTED) {
    return "Payment proof was rejected. See the reason on this page, then submit corrected proof.";
  }
  if (status === PAYMENT_STATUS.RETURNED) {
    return "Payment proof was returned for correction. See the reason on this page, then resubmit.";
  }
  return "Registration fee not submitted yet. Upload proof after paying.";
}

/** @deprecated Use applicationStatusSummary + paymentStatusSummary */
export function participantStatusSummary(
  applicationStatus: string,
  paymentStatus: string
): string {
  if (applicationStatus === APPLICATION_STATUS.REJECTED) {
    return applicationStatusSummary(applicationStatus);
  }
  if (applicationStatus === APPLICATION_STATUS.PENDING) {
    return applicationStatusSummary(applicationStatus);
  }
  return paymentStatusSummary(paymentStatus);
}

export function normalizeApplicationStatus(
  value: string
): ApplicationStatus {
  if (
    value === APPLICATION_STATUS.APPROVED ||
    value === APPLICATION_STATUS.REJECTED
  ) {
    return value;
  }
  return APPLICATION_STATUS.PENDING;
}

export function normalizePaymentStatusValue(value: string): PaymentStatus {
  return normalizePaymentStatus(value);
}

export { isPaymentVerified, isPaymentAwaitingVerification };
