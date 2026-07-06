"use client";

import { CHECKPOINTS, GLOSSARY } from "@/lib/pats-content";
import { cn } from "@/lib/utils";

export function OperationalMap() {
  return (
    <div className="operational-map grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
      <div className="operational-map__route relative overflow-hidden rounded-[var(--pats-radius-card,12px)] border p-6 sm:p-8">
        <p className="pats-eyebrow relative z-10 uppercase tracking-[0.22em]">
          Exercise route — live sequence
        </p>
        <div className="relative z-10 mt-6 space-y-1">
          {CHECKPOINTS.map((cp, i) => {
            const isActive = i > 0 && i < CHECKPOINTS.length - 1;
            return (
              <div
                key={cp.id}
                className={cn(
                  "group flex gap-4 border-l-2 py-3 pl-5 transition-colors duration-150",
                  isActive && "tac-route-node--steady"
                )}
              >
                <div
                  className={cn(
                    "operational-map__step flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-condensed text-xs font-bold uppercase transition-colors duration-150"
                  )}
                >
                  {i === 0 ? "IN" : i === CHECKPOINTS.length - 1 ? "OUT" : i}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h4 className="pats-type-title font-bold uppercase tracking-wide">
                      {cp.label}
                    </h4>
                    {"phase" in cp && cp.phase && (
                      <span className="pats-eyebrow text-[10px] uppercase tracking-widest">
                        {cp.phase}
                      </span>
                    )}
                    {cp.distance && (
                      <span className="font-condensed text-xs font-semibold uppercase tracking-wide text-[var(--pats-gold,#c8a84b)]">
                        ↗ {cp.distance}
                      </span>
                    )}
                  </div>
                  <ul className="mt-2 space-y-0.5">
                    {cp.activities.map((a) => (
                      <li key={a} className="pats-body text-sm">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="operational-map__glossary relative">
        <p className="pats-eyebrow uppercase tracking-[0.22em]">
          Operational HUD — terminology
        </p>
        <dl className="mt-5 space-y-3">
          {Object.entries(GLOSSARY).map(([term, def]) => (
            <div
              key={term}
              className="operational-map__term rounded-[var(--pats-radius-card,12px)] border px-4 py-3 transition-colors"
            >
              <dt className="pats-type-title font-bold uppercase tracking-wide text-[var(--pats-gold,#c8a84b)]">
                {term}
              </dt>
              <dd className="pats-body mt-1 text-sm leading-relaxed">{def}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
