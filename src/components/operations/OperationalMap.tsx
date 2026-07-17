"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { translatePatsText } from "@/lib/i18n/pats-content-i18n";
import { CHECKPOINTS, GLOSSARY } from "@/lib/pats-content";
import { cn } from "@/lib/utils";

export function OperationalMap() {
  const { t, locale } = useI18n();
  const map = t.marketing.operations.map;

  return (
    <div className="operational-map grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
      <div className="operational-map__route relative overflow-hidden rounded-[var(--pats-radius-card,12px)] border p-6 sm:p-8">
        <p className="pats-eyebrow relative z-10 uppercase tracking-[0.22em]">
          {map.routeTitle}
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
                  {i === 0
                    ? map.entry
                    : i === CHECKPOINTS.length - 1
                      ? map.exit
                      : i}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h4 className="pats-type-title font-bold uppercase tracking-wide">
                      {translatePatsText(cp.label, locale)}
                    </h4>
                    {"phase" in cp && cp.phase && (
                      <span className="pats-eyebrow text-[10px] uppercase tracking-widest">
                        {translatePatsText(cp.phase, locale)}
                      </span>
                    )}
                    {cp.distance && (
                      <span className="font-condensed text-xs font-semibold uppercase tracking-wide text-[var(--pats-gold,#c8a84b)]">
                        ↗ {translatePatsText(cp.distance, locale)}
                      </span>
                    )}
                  </div>
                  <ul className="mt-2 space-y-0.5">
                    {cp.activities.map((a) => (
                      <li key={a} className="pats-body text-sm">
                        {translatePatsText(a, locale)}
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
          {map.glossaryTitle}
        </p>
        <dl className="mt-5 space-y-3">
          {/* The term itself is an acronym (CP, CTR, CBRN…) and stays as-is in
              every locale; only its expansion is translated. */}
          {Object.entries(GLOSSARY).map(([term, def]) => (
            <div
              key={term}
              className="operational-map__term rounded-[var(--pats-radius-card,12px)] border px-4 py-3 transition-colors"
            >
              <dt className="pats-type-title font-bold uppercase tracking-wide text-[var(--pats-gold,#c8a84b)]">
                {term}
              </dt>
              <dd className="pats-body mt-1 text-sm leading-relaxed">
                {translatePatsText(def, locale)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
