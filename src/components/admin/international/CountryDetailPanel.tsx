"use client";

import { Globe, X } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import type { ParticipatingCountry } from "@/lib/international-participation-types";

const TEXT = "rgb(236,240,248)";
const MUTED = "rgb(148,163,190)";
const FAINT = "rgb(107,120,148)";
const BLUE = "rgb(96,165,250)";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.09)";

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}
    >
      <p
        className="mb-1 text-[11px] font-medium leading-none"
        style={{ color: MUTED }}
      >
        {label}
      </p>
      <p
        className="text-[20px] font-bold leading-none tracking-tight"
        style={{ color: TEXT }}
      >
        {value}
      </p>
    </div>
  );
}

export function CountryDetailPanel({
  country,
  year,
  rank,
  onClose,
}: {
  country: ParticipatingCountry | null;
  year: number;
  rank: number | null;
  onClose: () => void;
}) {
  if (!country) {
    return (
      <div
        className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl px-6 text-center"
        style={{ background: CARD, border: `1px solid ${BORDER}` }}
      >
        <Globe className="mb-3 h-8 w-8" style={{ color: FAINT }} aria-hidden />
        <p className="text-[13px] font-medium" style={{ color: MUTED }}>
          Select a country on the map or table to see its participation history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: CARD, border: `1px solid ${BORDER}` }}
      >
        <CountryFlag
          country={country.name}
          className="h-7 w-10 shrink-0 rounded-[4px] border border-[rgba(255,255,255,0.14)]"
        />
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[15px] font-bold leading-tight"
            style={{ color: TEXT }}
          >
            {country.name}
          </p>
          <p className="text-[11px] font-medium" style={{ color: FAINT }}>
            {country.region}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close country details"
          className="grid h-7 w-7 place-items-center rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", color: MUTED }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatBox label={`Total Teams (${year})`} value={country.teamCount} />
        <StatBox label={`Rank (${year})`} value={rank ? `#${rank}` : "—"} />
        <StatBox label="Region" value={country.region} />
        <StatBox label="ISO-2" value={country.iso2 || "—"} />
      </div>

      {/* Teams list */}
      <div
        className="rounded-2xl px-4 pb-3 pt-3.5"
        style={{ background: CARD, border: `1px solid ${BORDER}` }}
      >
        <p
          className="mb-2 text-[12px] font-semibold uppercase tracking-[0.04em]"
          style={{ color: MUTED }}
        >
          Teams Registered
        </p>
        <ul className="flex flex-wrap gap-2">
          {country.teams.length > 0 ? (
            country.teams.map((team) => (
              <li
                key={team}
                className="rounded-full px-3 py-1 text-[12px] font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: TEXT }}
              >
                {team}
              </li>
            ))
          ) : (
            <li className="text-[13px]" style={{ color: MUTED }}>
              No team names available.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
