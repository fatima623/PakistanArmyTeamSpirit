"use client";

import {
  TICKER_PRIORITY,
  TICKER_SCROLL_DURATION_SEC,
  DEFAULT_TICKER_SCROLL_SPEED,
  type PublicTickerItem,
} from "@/lib/ticker";
import { cn } from "@/lib/utils";

type Props = {
  items?: PublicTickerItem[];
  className?: string;
  scrollDurationSec?: number;
  variant?: "bar" | "overlay";
};

function TickerItems({ items }: { items: PublicTickerItem[] }) {
  return (
    <>
      {items.map((item) => {
        const isHighlighted =
          item.priority === TICKER_PRIORITY.CRITICAL || item.isUrgent;
        return (
          <span key={item.id} className="inline-flex shrink-0 items-center">
            <span className="mx-2 text-brand-brass sm:mx-3 md:mx-4" aria-hidden>
              ◆
            </span>
            <span
              className={cn(
                "whitespace-nowrap",
                isHighlighted && "text-brand-brass"
              )}
            >
              {item.message}
            </span>
          </span>
        );
      })}
    </>
  );
}

export function AnnouncementTicker({
  items = [],
  className,
  scrollDurationSec,
  variant = "bar",
}: Props) {
  const loopSec =
    scrollDurationSec ??
    TICKER_SCROLL_DURATION_SEC[DEFAULT_TICKER_SCROLL_SPEED];

  if (items.length === 0) return null;

  const isOverlay = variant === "overlay";
  const trackStyle = {
    "--announcement-ticker-duration-sec": String(loopSec),
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        "announcement-ticker relative",
        isOverlay
          ? "border-0 bg-transparent shadow-none"
          : "border-b border-brand-brass/20 bg-brand-night/95",
        className
      )}
      role="region"
      aria-label="Operational updates"
      aria-live="polite"
    >
      {!isOverlay && (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(197,168,128,0.1)_0%,transparent_8%,transparent_92%,rgba(197,168,128,0.1)_100%)]"
            aria-hidden
          />
          <div
            className="cinematic-noise pointer-events-none absolute inset-0 opacity-[0.05]"
            aria-hidden
          />
        </>
      )}

      <div className="announcement-ticker-viewport relative overflow-hidden pl-3 sm:pl-4">
        <div className="announcement-ticker-track flex w-max" style={trackStyle}>
          <div className="announcement-ticker-segment font-condensed font-semibold uppercase tracking-[0.06em] text-white sm:tracking-[0.08em]">
            <TickerItems items={items} />
          </div>
          <div
            className="announcement-ticker-segment font-condensed font-semibold uppercase tracking-[0.06em] text-white sm:tracking-[0.08em]"
            aria-hidden
          >
            <TickerItems items={items} />
          </div>
        </div>
      </div>

      {!isOverlay && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-brass/40 to-transparent"
          aria-hidden
        />
      )}
    </div>
  );
}
