"use client";

import {
  TICKER_PRIORITY,
  TICKER_SCROLL_DURATION_SEC,
  DEFAULT_TICKER_SCROLL_SPEED,
} from "@/lib/ticker";
import { cn } from "@/lib/utils";

type Props = {
  message: string;
  isUrgent: boolean;
  priority: string;
  scrollDurationSec?: number;
  className?: string;
};

function PreviewSegment({
  message,
  isHighlighted,
}: {
  message: string;
  isHighlighted: boolean;
}) {
  return (
    <>
      <span className="mx-3 text-tactical-brass" aria-hidden>
        ◆
      </span>
      <span
        className={cn("whitespace-nowrap", isHighlighted && "text-tactical-brass")}
      >
        {message}
      </span>
    </>
  );
}

export function TickerMarqueePreview({
  message,
  isUrgent,
  priority,
  scrollDurationSec,
  className,
}: Props) {
  const loopSec =
    scrollDurationSec ??
    TICKER_SCROLL_DURATION_SEC[DEFAULT_TICKER_SCROLL_SPEED];

  const trackStyle = {
    "--announcement-ticker-duration-sec": String(loopSec),
  } as React.CSSProperties;

  const isHighlighted =
    priority === TICKER_PRIORITY.CRITICAL || isUrgent;
  const displayMessage =
    message.trim() || "Your announcement will appear here…";

  return (
    <div className={cn("admin-ticker-preview", className)}>
      <div className="admin-ticker-preview-strip announcement-ticker border-cp-border bg-tactical-void/95">
        <div className="announcement-ticker-viewport relative overflow-hidden">
          <div
            className="announcement-ticker-track flex w-max"
            style={trackStyle}
          >
            <div className="announcement-ticker-segment font-condensed font-semibold uppercase tracking-[0.06em] text-white sm:tracking-[0.08em]">
              <PreviewSegment
                message={displayMessage}
                isHighlighted={isHighlighted}
              />
            </div>
            <div
              className="announcement-ticker-segment font-condensed font-semibold uppercase tracking-[0.06em] text-white sm:tracking-[0.08em]"
              aria-hidden
            >
              <PreviewSegment
                message={displayMessage}
                isHighlighted={isHighlighted}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
