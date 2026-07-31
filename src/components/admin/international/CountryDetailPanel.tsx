"use client";

import { ChevronRight, Globe, X } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CountryFlag } from "@/components/ui/CountryFlag";
import type { CountryParticipation } from "@/lib/international-participation-types";

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
  onSelectYear,
}: {
  country: CountryParticipation | null;
  year: number;
  rank: number | null;
  onClose: () => void;
  onSelectYear: (year: number) => void;
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

  const teamsThisYear = country.byYear[year] ?? 0;
  const chartData = country.years.map((y) => ({
    year: String(y),
    teams: country.byYear[y] ?? 0,
  }));

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
        <StatBox label={`Total Teams (${year})`} value={teamsThisYear} />
        <StatBox label={`Rank (${year})`} value={rank ? `#${rank}` : "—"} />
        <StatBox label="First Participation" value={country.firstYear} />
        <StatBox label="Total Participations" value={country.totalParticipations} />
      </div>

      {/* Teams over the years */}
      <div
        className="rounded-2xl px-4 pb-3 pt-3.5"
        style={{ background: CARD, border: `1px solid ${BORDER}` }}
      >
        <p
          className="mb-2 text-[12px] font-semibold uppercase tracking-[0.04em]"
          style={{ color: MUTED }}
        >
          Teams Over the Years
        </p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              width={34}
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.16)" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgb(17,23,40)",
                color: TEXT,
              }}
              labelStyle={{ color: MUTED }}
              itemStyle={{ color: BLUE }}
              formatter={(v) => [`${v ?? 0} teams`, "Teams"]}
            />
            <Line
              type="monotone"
              dataKey="teams"
              stroke={BLUE}
              strokeWidth={2.4}
              dot={{ r: 3, fill: BLUE, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Year-wise list */}
      <div
        className="rounded-2xl px-2 py-2"
        style={{ background: CARD, border: `1px solid ${BORDER}` }}
      >
        <p
          className="px-2 pb-1.5 pt-1.5 text-[12px] font-semibold uppercase tracking-[0.04em]"
          style={{ color: MUTED }}
        >
          Year Wise Teams List
        </p>
        <ul className="flex flex-col">
          {country.years
            .slice()
            .sort((a, b) => b - a)
            .map((y) => {
              const active = y === year;
              return (
                <li key={y}>
                  <button
                    type="button"
                    onClick={() => onSelectYear(y)}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors"
                    style={{
                      background: active ? "rgba(96,165,250,0.14)" : "transparent",
                    }}
                  >
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: active ? BLUE : TEXT }}
                    >
                      {y}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="text-[13px] font-semibold tabular-nums"
                        style={{ color: MUTED }}
                      >
                        {country.byYear[y] ?? 0} Teams
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" style={{ color: FAINT }} />
                    </span>
                  </button>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
