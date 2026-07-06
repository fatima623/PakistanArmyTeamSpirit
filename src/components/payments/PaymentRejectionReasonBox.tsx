import { AlertTriangle } from "lucide-react";

import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  normalizePaymentStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  status: string;
  reason: string | null | undefined;
  className?: string;
};

export function PaymentRejectionReasonBox({
  status,
  reason,
  className,
}: Props) {
  const normalized = normalizePaymentStatus(status);
  const isReject = normalized === PAYMENT_STATUS.REJECTED;
  const isReturned = normalized === PAYMENT_STATUS.RETURNED;

  if (!isReject && !isReturned) return null;

  const trimmed = reason?.trim();
  if (!trimmed) return null;

  const title = PAYMENT_STATUS_LABELS[normalized];
  const reasonLabel = isReturned
    ? "Reason for correction:"
    : "Reason for rejection:";

  return (
    <div
      className={cn("payment-rejection-reason-box", className)}
      role="alert"
    >
      <p className="payment-rejection-reason-box__title">
        <AlertTriangle
          className="payment-rejection-reason-box__icon"
          aria-hidden
        />
        {title}
      </p>
      <p className="payment-rejection-reason-box__body">
        <span className="payment-rejection-reason-box__label">{reasonLabel}</span>{" "}
        {trimmed}
      </p>
    </div>
  );
}

export function requiresPaymentRejectionReason(status: string): boolean {
  const normalized = normalizePaymentStatus(status);
  return (
    normalized === PAYMENT_STATUS.REJECTED ||
    normalized === PAYMENT_STATUS.RETURNED
  );
}
