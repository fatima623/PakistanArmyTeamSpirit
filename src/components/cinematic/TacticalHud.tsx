"use client";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  scan?: boolean;
  frame?: boolean;
};

/** Corner brackets + optional scan sweep for cinematic sections */
export function TacticalHud({ className, scan = true, frame = true }: Props) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {scan && <div className="tac-scan-overlay" />}
      {frame && (
        <>
          <div className="tac-hud-frame" />
          <div className="tac-hud-corner-tr" />
          <div className="tac-hud-corner-bl" />
        </>
      )}
    </div>
  );
}
