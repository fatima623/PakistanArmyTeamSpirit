"use client";

import { Globe, X } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import type { ParticipatingCountry } from "@/lib/international-participation-types";

/** One edition a country took part in, used for the appearances list. */
export type CountryEdition = {
  year: number;
  edition: number;
  teams: string[];
};

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="intl-statbox">
      <p className="intl-statbox__label">{label}</p>
      <p className="intl-statbox__value">{value}</p>
    </div>
  );
}

export function CountryDetailPanel({
  country,
  periodLabel,
  rank,
  history,
  onClose,
}: {
  country: ParticipatingCountry | null;
  /** Period the surrounding dashboard is filtered to, e.g. "2026". */
  periodLabel: string;
  rank: number | null;
  /** Every edition this country appeared in, newest first. */
  history: CountryEdition[];
  onClose: () => void;
}) {
  if (!country) {
    return (
      <div className="intl-panel intl-panel--empty">
        <Globe className="intl-panel__empty-icon" aria-hidden />
        <p className="intl-panel__empty-text">
          Select a country on the map or in the table to see its participation
          history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="intl-panel intl-panel__header">
        <CountryFlag country={country.name} className="intl-panel__flag" />
        <div className="min-w-0 flex-1">
          <p className="intl-panel__name">{country.name}</p>
          <p className="intl-panel__region">{country.region}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close country details"
          className="intl-panel__close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatBox label={`Teams (${periodLabel})`} value={country.teamCount} />
        <StatBox label={`Rank (${periodLabel})`} value={rank ? `#${rank}` : "—"} />
        <StatBox label="Appearances" value={history.length} />
        <StatBox label="ISO-2" value={country.iso2 || "—"} />
      </div>

      {/* Teams list for the selected period */}
      <div className="intl-panel">
        <p className="intl-panel__title">Teams · {periodLabel}</p>
        <ul className="flex flex-wrap gap-2">
          {country.teams.length > 0 ? (
            country.teams.map((team, i) => (
              <li key={`${team}-${i}`} className="intl-chip">
                {team}
              </li>
            ))
          ) : (
            <li className="intl-panel__muted">No team names available.</li>
          )}
        </ul>
      </div>

      {/* Year-wise participation record */}
      <div className="intl-panel">
        <p className="intl-panel__title">Participation by edition</p>
        {history.length > 0 ? (
          <ul className="intl-history">
            {history.map((h) => (
              <li key={h.year} className="intl-history__row">
                <span className="intl-history__year">{h.year}</span>
                <span className="intl-history__edition">
                  {h.edition > 0 ? `${ordinal(h.edition)} Intl` : "Registered"}
                </span>
                <span className="intl-history__teams">
                  {h.teams.length} team{h.teams.length === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="intl-panel__muted">No editions on record.</p>
        )}
      </div>
    </div>
  );
}

/** 1 -> "1st", 2 -> "2nd", 3 -> "3rd", everything else -> "nth". */
function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
