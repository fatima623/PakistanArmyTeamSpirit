"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  PAYMENT_STATUS_LABELS,
  normalizePaymentStatus,
} from "@/lib/constants";
import {
  type PaymentRejectionHistoryEntry,
  rejectionHistoryTypeLabel,
  shouldShowPaymentStatusTimeline,
} from "@/lib/payment-rejection-history";
import { formatDateTime, cn } from "@/lib/utils";
import "@/app/payment-status-timeline.css";

type Props = {
  status: string;
  history: PaymentRejectionHistoryEntry[];
  className?: string;
};

export function PaymentStatusTimeline({ status, history, className }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (!shouldShowPaymentStatusTimeline(status, history)) {
    return null;
  }

  const statusKey = normalizePaymentStatus(status);
  const statusLabel = PAYMENT_STATUS_LABELS[statusKey];
  const collapsible = history.length > 1;
  const [mostRecent, ...older] = history;

  return (
    <div className={cn("payment-status-timeline", className)}>
      <div className="payment-status-timeline__current">
        <span className="payment-status-timeline__current-label">
          Current Status:
        </span>{" "}
        <span className="payment-status-timeline__current-value">
          {statusLabel}
        </span>
      </div>

      <div className="payment-status-timeline__divider" aria-hidden />

      {collapsible ? (
        <button
          type="button"
          className="payment-status-timeline__toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          <span>Rejection History ({history.length})</span>
          <ChevronDown
            className={cn(
              "payment-status-timeline__chevron",
              expanded && "payment-status-timeline__chevron--open"
            )}
            aria-hidden
          />
        </button>
      ) : (
        <p className="payment-status-timeline__heading">Rejection History</p>
      )}

      {(!collapsible || expanded) && (
        <ol className="payment-status-timeline__list">
          {mostRecent ? (
            <TimelineEntry entry={mostRecent} isMostRecent />
          ) : null}
          {older.map((entry) => (
            <TimelineEntry key={entry.id} entry={entry} />
          ))}
        </ol>
      )}
    </div>
  );
}

function TimelineEntry({
  entry,
  isMostRecent = false,
}: {
  entry: PaymentRejectionHistoryEntry;
  isMostRecent?: boolean;
}) {
  return (
    <li className="payment-status-timeline__item">
      <span
        className={cn(
          "payment-status-timeline__date",
          isMostRecent && "payment-status-timeline__date--recent"
        )}
      >
        {formatDateTime(entry.createdAt)}
      </span>
      <span className="payment-status-timeline__type">
        {rejectionHistoryTypeLabel(entry.type)}
      </span>
      <p className="payment-status-timeline__reason">
        <span className="payment-status-timeline__reason-label">Reason:</span>{" "}
        {entry.reason}
      </p>
    </li>
  );
}
