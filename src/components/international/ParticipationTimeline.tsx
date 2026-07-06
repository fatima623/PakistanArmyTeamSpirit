"use client";

import {
  COUNTRY_NAMES,
  INTERNATIONAL_EDITIONS,
  type CountryCode,
} from "@/lib/pats-content";

function FlagBadge({ code }: { code: CountryCode }) {
  return (
    <span
      title={COUNTRY_NAMES[code]}
      className="tac-edition-flag inline-flex items-center rounded-sm border px-2 py-1 font-condensed text-xs font-semibold uppercase tracking-wide"
    >
      {COUNTRY_NAMES[code]}
    </span>
  );
}

export function ParticipationTimeline() {
  return (
    <div className="space-y-6">
      {INTERNATIONAL_EDITIONS.map((ed) => (
        <article
          key={ed.year}
          className="tac-edition-row group relative overflow-hidden rounded-sm border border-white/10 bg-tactical-navy/40 p-5 backdrop-blur-md transition-colors hover:border-tactical-brass/30 sm:p-6"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-tactical-brass/80 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="tac-edition-row__title font-display text-lg font-bold uppercase">
              {ed.edition}
              {ed.edition === 2
                ? "nd"
                : ed.edition === 3
                  ? "rd"
                  : "th"}{" "}
              International PATS — {ed.year}
            </h3>
            <span className="tac-edition-row__meta font-condensed text-sm font-bold uppercase tracking-wider">
              {ed.countries.length} nations
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {ed.countries.map((c) => (
              <FlagBadge key={`${ed.year}-${c}`} code={c} />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
