import type { ReactNode } from "react";

import { PafScrollObserver } from "@/components/army/PafScrollObserver";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  fullBleed?: boolean;
  dayTheme?: boolean;
};

export function CinematicShell({
  children,
  fullBleed = false,
  dayTheme = false,
}: Props) {
  return (
    <div
      className={cn(
        "cinematic-site army-site page-shell min-h-screen min-h-[100dvh]",
        !fullBleed && "cinematic-layout-standard",
        dayTheme ? "army-site--day text-cp-ink" : "bg-bg-base text-white"
      )}
    >
      <PafScrollObserver />
      <div
        className={cn(
          "cinematic-noise pointer-events-none fixed inset-0 z-[1]",
          dayTheme ? "opacity-[0.04]" : "opacity-[0.04]"
        )}
      />
      <main
        id="main-content"
        className="relative z-[2]"
      >
        {children}
      </main>
    </div>
  );
}
