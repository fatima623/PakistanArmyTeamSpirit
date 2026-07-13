"use client";

import Link from "next/link";
import { Volume2 } from "lucide-react";

import {
  DEFAULT_TICKER_SCROLL_SPEED,
  TICKER_PRIORITY,
  TICKER_SCROLL_DURATION_SEC,
} from "@/lib/ticker";
import { cn } from "@/lib/utils";

export type MarqueeItem = {
  id: string;
  message: string;
  /** When set, the item links here (e.g. an announcement detail page). */
  href?: string;
  priority?: string;
  isUrgent?: boolean;
};

type Props = {
  items?: MarqueeItem[];
  className?: string;
  scrollDurationSec?: number;
  variant?: "bar" | "overlay";
  /** Show the red speaker badge pinned to the left. */
  showSpeaker?: boolean;
};

function TickerItems({
  items,
  interactive = true,
}: {
  items: MarqueeItem[];
  interactive?: boolean;
}) {
  return (
    <>
      {items.map((item) => {
        const isHighlighted =
          item.priority === TICKER_PRIORITY.CRITICAL || item.isUrgent;
        const label = (
          <span
            className={cn(
              "announcement-ticker-item whitespace-nowrap",
              isHighlighted && "text-brand-brass"
            )}
          >
            {item.message}
          </span>
        );
        return (
          <span key={item.id} className="inline-flex shrink-0 items-center">
            <span className="mx-2 text-brand-brass sm:mx-3 md:mx-4" aria-hidden>
              ◆
            </span>
            {item.href && interactive ? (
              <Link href={item.href} className="announcement-ticker-link">
                {label}
              </Link>
            ) : (
              label
            )}
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
  showSpeaker = false,
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
        showSpeaker && "announcement-ticker--speaker",
        isOverlay
          ? "border-0 bg-transparent shadow-none"
          : "border-b border-brand-brass/20 bg-brand-night/95",
        className
      )}
      role="region"
      aria-label="Announcements"
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

      {showSpeaker ? (
        <span className="announcement-ticker-speaker" aria-hidden>
          <Volume2 className="h-4 w-4" />
        </span>
      ) : null}

      <div className="announcement-ticker-viewport relative overflow-hidden pl-3 sm:pl-4">
        <div className="announcement-ticker-track flex w-max" style={trackStyle}>
          <div className="announcement-ticker-segment font-condensed font-semibold uppercase tracking-[0.06em] text-white sm:tracking-[0.08em]">
            <TickerItems items={items} />
          </div>
          <div
            className="announcement-ticker-segment font-condensed font-semibold uppercase tracking-[0.06em] text-white sm:tracking-[0.08em]"
            aria-hidden
          >
            <TickerItems items={items} interactive={false} />
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
