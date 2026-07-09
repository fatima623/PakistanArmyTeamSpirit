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
    <div className={cn("mt-4 rounded-lg border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50 px-[1.125rem] py-4 text-amber-900", className)}>
      <div className="text-sm leading-[1.45]">
        <span className="font-semibold text-amber-800">
          Current Status:
        </span>{" "}
        <span className="font-semibold text-amber-950">
          {statusLabel}
        </span>
      </div>

      <div className="my-3.5 border-t border-amber-300" aria-hidden />

      {collapsible ? (
        <button
          type="button"
          className="mb-3 flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent p-0 text-left text-[0.8125rem] font-semibold tracking-[0.02em] text-amber-800 hover:text-amber-900"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          <span>Rejection History ({history.length})</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-transform duration-200",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </button>
      ) : (
        <p className="mb-3 text-[0.8125rem] font-semibold tracking-[0.02em] text-amber-800">Rejection History</p>
      )}

      {(!collapsible || expanded) && (
        <ol className="m-0 list-none p-0">
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
    <li className="relative pb-4 pl-[1.125rem] before:absolute before:left-0 before:top-[0.35rem] before:h-2 before:w-2 before:rounded-full before:bg-amber-500 before:ring-2 before:ring-amber-50 before:content-[''] last:pb-0 [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:bottom-0 [&:not(:last-child)]:after:left-[0.1875rem] [&:not(:last-child)]:after:top-[0.85rem] [&:not(:last-child)]:after:w-0.5 [&:not(:last-child)]:after:bg-amber-300 [&:not(:last-child)]:after:content-['']">
      <span
        className={cn(
          "block text-[0.8125rem] leading-[1.4] text-amber-800",
          isMostRecent && "font-bold text-amber-950"
        )}
      >
        {formatDateTime(entry.createdAt)}
      </span>
      <span className="mt-0.5 block text-[0.8125rem] font-semibold text-amber-900">
        {rejectionHistoryTypeLabel(entry.type)}
      </span>
      <p className="mt-1 text-[0.8125rem] leading-normal text-amber-900">
        <span className="font-semibold text-amber-800">Reason:</span>{" "}
        {entry.reason}
      </p>
    </li>
  );
}
