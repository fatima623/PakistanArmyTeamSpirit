"use client";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  compact?: boolean;
};

export function RouteLoadingShell({
  title,
  description,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        "min-h-[40vh] w-full animate-pulse",
        compact
          ? "bg-[linear-gradient(180deg,rgba(17,31,14,0.92)_0%,rgba(15,25,35,0.98)_100%)]"
          : "bg-[linear-gradient(180deg,rgba(15,25,35,0.96)_0%,rgba(17,31,14,0.96)_100%)]"
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-10">
        <div className="overflow-hidden border border-white/10 bg-white/[0.04]">
          <div className="h-40 w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.09)_50%,rgba(255,255,255,0.03)_100%)] sm:h-52" />
          <div className="space-y-4 px-5 py-5 sm:px-8 sm:py-6">
            <div className="h-3 w-28 bg-white/15" />
            <div className="h-10 w-64 max-w-full bg-white/15 sm:w-80" />
            {description ? <div className="h-4 w-96 max-w-full bg-white/10" /> : null}
          </div>
        </div>

        <div className={cn("grid gap-5", compact ? "lg:grid-cols-2" : "lg:grid-cols-[1.05fr_0.95fr]")}>
          <div className="space-y-4 border border-white/10 bg-white/[0.04] p-5 sm:p-8">
            <div className="h-3 w-24 bg-white/15" />
            <div className="h-8 w-56 max-w-full bg-white/15" />
            <div className="h-4 w-full bg-white/10" />
            <div className="h-4 w-11/12 bg-white/10" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-16 bg-white/[0.05]" />
              <div className="h-16 bg-white/[0.05]" />
              <div className="h-16 bg-white/[0.05]" />
              <div className="h-16 bg-white/[0.05]" />
            </div>
          </div>

          <div className="space-y-4 border border-white/10 bg-white/[0.04] p-5 sm:p-8">
            <div className="h-3 w-20 bg-white/15" />
            <div className="h-8 w-48 max-w-full bg-white/15" />
            <div className="space-y-3">
              <div className="h-12 bg-white/[0.05]" />
              <div className="h-12 bg-white/[0.05]" />
              <div className="h-12 bg-white/[0.05]" />
            </div>
          </div>
        </div>

        <span className="sr-only">{title} is loading.</span>
      </div>
    </div>
  );
}
