/**
 * Ticker Messages configuration (no hardcoded messages).
 *
 * Admin-entered ticker messages surface on the PARTICIPANT dashboard (the
 * Latest Updates card). The public marquee scrolls Announcements (NewsPost)
 * instead — only the scroll-speed constants below are shared with it.
 */

export const TICKER_PRIORITY = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  NORMAL: "NORMAL",
} as const;

export type TickerPriority =
  (typeof TICKER_PRIORITY)[keyof typeof TICKER_PRIORITY];

export const TICKER_STATUS = {
  ACTIVE: "ACTIVE",
  DRAFT: "DRAFT",
  DISABLED: "DISABLED",
  EXPIRED: "EXPIRED",
} as const;

export type TickerStatus = (typeof TICKER_STATUS)[keyof typeof TICKER_STATUS];

/**
 * Legacy per-surface targeting. The column still exists on old rows, but every
 * ticker message now feeds the participant dashboard regardless of its value.
 */
export const TICKER_VISIBILITY = {
  HOMEPAGE: "HOMEPAGE",
  LOGIN: "LOGIN",
  DASHBOARD_BANNER: "DASHBOARD_BANNER",
  GLOBAL: "GLOBAL",
} as const;

export type TickerVisibility =
  (typeof TICKER_VISIBILITY)[keyof typeof TICKER_VISIBILITY];

export const TICKER_PRIORITY_LABELS: Record<TickerPriority, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  NORMAL: "Normal",
};

export const TICKER_STATUS_LABELS: Record<TickerStatus, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  DISABLED: "Disabled",
  EXPIRED: "Expired",
};

/** Lower number = higher precedence in the displayed list. */
export const TICKER_PRIORITY_RANK: Record<TickerPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  NORMAL: 3,
};

export const TICKER_SCROLL_SPEED = {
  SLOW: "SLOW",
  NORMAL: "NORMAL",
  FAST: "FAST",
  VERY_FAST: "VERY_FAST",
} as const;

export type TickerScrollSpeed =
  (typeof TICKER_SCROLL_SPEED)[keyof typeof TICKER_SCROLL_SPEED];

export const TICKER_SCROLL_SPEED_LABELS: Record<TickerScrollSpeed, string> = {
  SLOW: "Slow",
  NORMAL: "Normal",
  FAST: "Fast",
  VERY_FAST: "Very fast",
};

/** Seconds for one full marquee loop (duplicated track). Lower = faster scroll.
 *  Durations raised to slow the marquee down (the public news marquee reads at
 *  a relaxed pace so headlines are easy to follow / hover). */
export const TICKER_SCROLL_DURATION_SEC: Record<TickerScrollSpeed, number> = {
  SLOW: 95,
  NORMAL: 70,
  FAST: 48,
  VERY_FAST: 28,
};

export const DEFAULT_TICKER_SCROLL_SPEED = TICKER_SCROLL_SPEED.SLOW;

export function parseTickerScrollSpeed(
  value: string | null | undefined
): TickerScrollSpeed {
  const speeds = Object.values(TICKER_SCROLL_SPEED);
  if (value && speeds.includes(value as TickerScrollSpeed)) {
    return value as TickerScrollSpeed;
  }
  return DEFAULT_TICKER_SCROLL_SPEED;
}

export function tickerScrollDurationSec(
  speed: string | null | undefined,
  options?: { reducedMotion?: boolean }
): number {
  const parsed = parseTickerScrollSpeed(speed);
  const base = TICKER_SCROLL_DURATION_SEC[parsed];
  return options?.reducedMotion ? Math.round(base * 2) : base;
}

/** Total character count across ticker messages (proxy for marquee segment width). */
export function sumTickerMessageChars(items: { message: string }[]): number {
  return items.reduce((sum, item) => sum + item.message.length, 0);
}

/**
 * Preview duration so one message scrolls at the same px/s as the live homepage
 * ticker (fixed loop time × full homepage segment width).
 */
export function tickerPreviewDurationSec(
  message: string,
  siteLoopDurationSec: number,
  referenceTotalChars: number
): number {
  const previewChars = Math.max(message.trim().length, 24);
  const refChars = Math.max(referenceTotalChars, previewChars);
  const scaled = siteLoopDurationSec * (previewChars / refChars);
  return Math.round(Math.max(8, Math.min(siteLoopDurationSec, scaled)));
}

export type PublicTickerItem = {
  id: string;
  message: string;
  priority: TickerPriority;
  isUrgent: boolean;
  /** ISO timestamp — the date shown next to the message on the dashboard. */
  createdAt: string;
};

export function isTickerExpired(
  expiresAt: Date | string | null | undefined,
  now = new Date()
): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= now.getTime();
}

export function effectiveTickerStatus(
  status: string,
  expiresAt: Date | string | null | undefined,
  now = new Date()
): TickerStatus {
  if (
    status === TICKER_STATUS.ACTIVE &&
    isTickerExpired(expiresAt, now)
  ) {
    return TICKER_STATUS.EXPIRED;
  }
  const allowed = Object.values(TICKER_STATUS);
  if (allowed.includes(status as TickerStatus)) {
    return status as TickerStatus;
  }
  return TICKER_STATUS.DRAFT;
}

export function compareTickersForDisplay<
  T extends { priority: string; sortOrder: number; createdAt: Date | string }
>(a: T, b: T): number {
  const rankA =
    TICKER_PRIORITY_RANK[a.priority as TickerPriority] ??
    TICKER_PRIORITY_RANK.NORMAL;
  const rankB =
    TICKER_PRIORITY_RANK[b.priority as TickerPriority] ??
    TICKER_PRIORITY_RANK.NORMAL;
  if (rankA !== rankB) return rankA - rankB;
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return (
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
