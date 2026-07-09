import {
  effectiveTickerStatus,
  TICKER_PRIORITY,
  TICKER_STATUS,
  TICKER_VISIBILITY,
  type TickerPriority,
  type TickerStatus,
  type TickerVisibility,
} from "@/lib/ticker";

export type SerializedTicker = {
  id: string;
  message: string;
  shortLabel: string | null;
  priority: string;
  status: string;
  visibility: string;
  isUrgent: boolean;
  sortOrder: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublishState = "DRAFT" | "LIVE" | "DISABLED";

export type TickerFormState = {
  message: string;
  priority: TickerPriority;
  publishState: PublishState;
  visibility: TickerVisibility;
  isUrgent: boolean;
  sortOrder: number;
  expiresAt: string;
};

export const EMPTY_TICKER_FORM: TickerFormState = {
  message: "",
  priority: TICKER_PRIORITY.NORMAL,
  publishState: "DRAFT",
  visibility: TICKER_VISIBILITY.HOMEPAGE,
  isUrgent: false,
  sortOrder: 0,
  expiresAt: "",
};

export function nextTickerSortOrder(tickers: { sortOrder: number }[]) {
  if (tickers.length === 0) return 0;
  return Math.max(...tickers.map((t) => t.sortOrder)) + 1;
}

export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function publishStateFromTicker(t: SerializedTicker): PublishState {
  const effective = effectiveTickerStatus(t.status, t.expiresAt);
  if (effective === TICKER_STATUS.ACTIVE) return "LIVE";
  if (effective === TICKER_STATUS.DISABLED) return "DISABLED";
  return "DRAFT";
}

export function formFromTicker(t: SerializedTicker): TickerFormState {
  return {
    message: t.message,
    priority: t.priority as TickerPriority,
    publishState: publishStateFromTicker(t),
    visibility: t.visibility as TickerVisibility,
    isUrgent: t.isUrgent,
    sortOrder: t.sortOrder,
    expiresAt: toDatetimeLocalValue(t.expiresAt),
  };
}

export function statusFromPublishState(state: PublishState): TickerStatus {
  if (state === "LIVE") return TICKER_STATUS.ACTIVE;
  if (state === "DISABLED") return TICKER_STATUS.DISABLED;
  return TICKER_STATUS.DRAFT;
}

export function payloadFromTickerForm(form: TickerFormState) {
  return {
    message: form.message.trim(),
    priority: form.priority,
    status: statusFromPublishState(form.publishState),
    visibility: form.visibility,
    isUrgent: form.isUrgent,
    sortOrder: form.sortOrder,
    expiresAt: form.expiresAt.trim() || null,
  };
}

export function serializeTickerFromApi(ticker: {
  id: string;
  message: string;
  shortLabel: string | null;
  priority: string;
  status: string;
  visibility: string;
  isUrgent: boolean;
  sortOrder: number;
  expiresAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}): SerializedTicker {
  return {
    ...ticker,
    expiresAt: ticker.expiresAt
      ? new Date(ticker.expiresAt).toISOString()
      : null,
    createdAt: new Date(ticker.createdAt).toISOString(),
    updatedAt: new Date(ticker.updatedAt).toISOString(),
  };
}

export function serializeTickerRow(row: {
  id: string;
  message: string;
  shortLabel: string | null;
  priority: string;
  status: string;
  visibility: string;
  isUrgent: boolean;
  sortOrder: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SerializedTicker {
  return {
    id: row.id,
    message: row.message,
    shortLabel: row.shortLabel,
    priority: row.priority,
    status: row.status,
    visibility: row.visibility,
    isUrgent: row.isUrgent,
    sortOrder: row.sortOrder,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function tickerPayloadFromRow(t: SerializedTicker, sortOrder: number) {
  return {
    message: t.message,
    shortLabel: t.shortLabel,
    priority: t.priority,
    status: t.status,
    visibility: t.visibility,
    isUrgent: t.isUrgent,
    sortOrder,
    expiresAt: t.expiresAt,
  };
}

export function priorityBadgeClass(priority: string) {
  switch (priority) {
    case TICKER_PRIORITY.CRITICAL:
      return "border-red-200 bg-red-50 text-red-800";
    case TICKER_PRIORITY.HIGH:
      return "border-orange-200 bg-orange-50 text-orange-800";
    case TICKER_PRIORITY.MEDIUM:
      return "border-yellow-300 bg-yellow-50 text-yellow-800";
    default:
      return "border-black/[0.08] bg-brand-parchment/60 text-brand-ink-muted";
  }
}

export function statusBadgeClass(status: TickerStatus) {
  switch (status) {
    case TICKER_STATUS.ACTIVE:
      return "border-green-200 bg-green-50 text-green-800";
    case TICKER_STATUS.DRAFT:
      return "border-black/[0.08] bg-brand-parchment/60 text-brand-ink-muted";
    case TICKER_STATUS.DISABLED:
      return "border-gray-200 bg-gray-50 text-slate-900";
    default:
      return "border-red-200 bg-red-50 text-red-900";
  }
}

export function formatTickerExpiry(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
