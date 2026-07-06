import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  children: ReactNode;
  className?: string;
  variant?: "void" | "navy" | "slate" | "panel";
  withGrid?: boolean;
};

const variants = {
  void: "bg-tactical-void",
  navy: "bg-tactical-navy",
  slate: "bg-tactical-slate",
  panel: "bg-tactical-panel",
};

export function CinematicSection({
  id,
  children,
  className,
  variant = "void",
  withGrid = true,
}: Props) {
  return (
    <section
      id={id}
      className={cn(
        /* SECTION SPACING LOCKED: py-8 md:py-12 lg:py-16 = 32/48/64px */
        "cinematic-section relative overflow-hidden py-8 md:py-12 lg:py-16",
        variants[variant],
        className
      )}
    >
      {withGrid && (
        <div
          className="pointer-events-none absolute inset-0 bg-tactical-grid bg-grid-48 opacity-[0.18]"
          aria-hidden
        />
      )}
      <div className="tac-section-fog" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/45" />
      <div className="cinematic-noise pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-12">
        {children}
      </div>
    </section>
  );
}
