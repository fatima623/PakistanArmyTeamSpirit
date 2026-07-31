"use client";

import { useCallback, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Download,
  Globe,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { REGIONS, type Region } from "@/lib/country-region";
import type {
  CountryParticipation,
  InternationalParticipation,
} from "@/lib/international-participation-types";

import { CountryDetailPanel } from "./CountryDetailPanel";
import { ParticipationWorldMap, type MapDatum } from "./ParticipationWorldMap";

const C = {
  text: "rgb(236,240,248)",
  muted: "rgb(148,163,190)",
  faint: "rgb(107,120,148)",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.09)",
  borderSoft: "rgba(255,255,255,0.07)",
  blue: "rgb(96,165,250)",
  green: "rgb(52,211,153)",
  red: "rgb(248,113,113)",
  violet: "rgb(167,139,250)",
  amber: "rgb(251,191,36)",
  rowSelected: "rgba(96,165,250,0.12)",
};

/** Team count for a country in a given year (0 when it didn't participate). */
function teamsIn(c: CountryParticipation, year: number): number {
  return c.byYear[year] ?? 0;
}

/** Top-ranked country name for a year — used for the initial selection. */
function topCountryName(
  countries: CountryParticipation[],
  year: number
): string | null {
  let best: { name: string; count: number } | null = null;
  for (const c of countries) {
    const count = teamsIn(c, year);
    if (count <= 0) continue;
    if (!best || count > best.count) best = { name: c.name, count };
  }
  return best?.name ?? null;
}

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Tiny inline sparkline of a country's team counts over the full timeline. */
function Sparkline({ values }: { values: number[] }) {
  const w = 62;
  const h = 22;
  const pad = 2;
  if (values.length === 0) return <span style={{ color: C.faint }}>—</span>;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {values.length === 1 ? (
        <circle cx={w / 2} cy={h / 2} r={2.4} fill={C.green} />
      ) : (
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={C.green}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function Delta({
  value,
  year,
  decimals = 0,
}: {
  value: number | null;
  year: number | null;
  decimals?: number;
}) {
  if (value == null || year == null) {
    return (
      <span className="text-[11px] font-medium" style={{ color: C.faint }}>
        No prior year
      </span>
    );
  }
  const up = value > 0;
  const down = value < 0;
  const color = up ? C.green : down ? C.red : C.muted;
  const arrow = up ? "▲" : down ? "▼" : "▬";
  const mag = Math.abs(value).toFixed(decimals);
  return (
    <span
      className="text-[11px] font-semibold"
      style={{ color }}
    >
      {arrow} {mag} vs {year}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delta,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  delta?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium" style={{ color: C.muted }}>
          {label}
        </p>
        <p
          className="mt-0.5 text-[26px] font-bold leading-none tracking-tight"
          style={{ color: C.text }}
        >
          {value}
        </p>
        <p className="mt-1.5 leading-none">{delta ?? (
          <span className="text-[11px] font-medium" style={{ color: C.faint }}>
            {hint}
          </span>
        )}</p>
      </div>
    </div>
  );
}

export function InternationalParticipationDashboard({
  data,
}: {
  data: InternationalParticipation;
}) {
  const years = data.years;
  const yearsAsc = useMemo(() => [...years].sort((a, b) => a - b), [years]);
  const fallbackYear = years[0] ?? new Date().getFullYear();

  const [year, setYear] = useState(fallbackYear);
  const [region, setRegion] = useState<Region | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(() =>
    topCountryName(data.countries, fallbackYear)
  );

  const prevYear = useMemo(
    () => years.find((y) => y < year) ?? null,
    [years, year]
  );

  // Participating countries for the year, ranked by team count.
  const ranked = useMemo(() => {
    return data.countries
      .map((c) => ({ c, count: teamsIn(c, year) }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count || a.c.name.localeCompare(b.c.name))
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [data.countries, year]);

  const rankByName = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of ranked) m.set(r.c.name, r.rank);
    return m;
  }, [ranked]);

  const stats = useMemo(() => {
    const totalCountries = ranked.length;
    const totalTeams = ranked.reduce((s, r) => s + r.count, 0);
    const newCountries = ranked.filter((r) => r.c.firstYear === year).length;
    const avg = totalCountries ? totalTeams / totalCountries : 0;

    let dCountries: number | null = null;
    let dTeams: number | null = null;
    let dAvg: number | null = null;
    if (prevYear != null) {
      const prev = data.countries
        .map((c) => teamsIn(c, prevYear))
        .filter((n) => n > 0);
      const prevCountries = prev.length;
      const prevTeams = prev.reduce((s, n) => s + n, 0);
      const prevAvg = prevCountries ? prevTeams / prevCountries : 0;
      dCountries = totalCountries - prevCountries;
      dTeams = totalTeams - prevTeams;
      dAvg = avg - prevAvg;
    }
    return { totalCountries, totalTeams, newCountries, avg, dCountries, dTeams, dAvg };
  }, [ranked, data.countries, prevYear, year]);

  const mapData: MapDatum[] = useMemo(
    () => ranked.map((r) => ({ iso2: r.c.iso2, name: r.c.name, count: r.count })),
    [ranked]
  );

  const regionOptions = useMemo(() => {
    const present = new Set(ranked.map((r) => r.c.region));
    return REGIONS.filter((r) => present.has(r));
  }, [ranked]);

  const tableRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ranked.filter((r) => {
      if (region !== "all" && r.c.region !== region) return false;
      if (q && !r.c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [ranked, region, search]);

  const selectedCountry = useMemo(
    () => data.countries.find((c) => c.name === selectedName) ?? null,
    [data.countries, selectedName]
  );

  const onSelect = useCallback((name: string) => setSelectedName(name), []);

  const handleExport = useCallback(() => {
    const header = [
      "Rank",
      "Country",
      "Region",
      `Teams ${year}`,
      prevYear != null ? `Change vs ${prevYear}` : "Change",
      "First Participation",
      "Total Participations",
    ];
    const body = tableRows.map((r) => [
      r.rank,
      r.c.name,
      r.c.region,
      r.count,
      prevYear != null ? r.count - teamsIn(r.c, prevYear) : "",
      r.c.firstYear,
      r.c.totalParticipations,
    ]);
    const csv = [header, ...body]
      .map((row) => row.map(csvCell).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `international-participation-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tableRows, year, prevYear]);

  const cardStyle = { background: C.card, border: `1px solid ${C.border}` };

  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      dir="ltr"
      style={{
        background: "linear-gradient(180deg, rgb(13,18,32) 0%, rgb(9,12,22) 100%)",
        border: `1px solid ${C.borderSoft}`,
      }}
    >
      {/* Header */}
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1
            className="text-[22px] font-bold leading-none tracking-tight"
            style={{ color: C.text }}
          >
            International Participation
          </h1>
          <p className="mt-1.5 text-[13px]" style={{ color: C.muted }}>
            Countries-wise teams on the world map
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex flex-wrap items-center gap-1 rounded-full p-1"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.borderSoft}` }}
          >
            {years.map((y) => {
              const active = y === year;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className="rounded-full px-3 py-1 text-[13px] font-semibold transition-colors"
                  style={{
                    background: active ? C.blue : "transparent",
                    color: active ? "rgb(9,12,22)" : C.muted,
                  }}
                >
                  {y}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors"
            style={{ border: `1px solid ${C.border}`, color: C.text }}
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Countries"
          value={String(stats.totalCountries)}
          icon={Globe}
          accent={C.blue}
          delta={<Delta value={stats.dCountries} year={prevYear} />}
        />
        <StatCard
          label="Total Teams"
          value={String(stats.totalTeams)}
          icon={Users}
          accent={C.green}
          delta={<Delta value={stats.dTeams} year={prevYear} />}
        />
        <StatCard
          label="New Countries"
          value={String(stats.newCountries)}
          icon={UserPlus}
          accent={C.violet}
          hint={`First-time nations in ${year}`}
        />
        <StatCard
          label="Avg Teams / Country"
          value={stats.avg.toFixed(1)}
          icon={Activity}
          accent={C.amber}
          delta={<Delta value={stats.dAvg} year={prevYear} decimals={1} />}
        />
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Map */}
          <section className="rounded-2xl p-3" style={cardStyle}>
            <div className="mb-1 flex items-center justify-between px-1">
              <p
                className="text-[13px] font-semibold uppercase tracking-[0.05em]"
                style={{ color: C.muted }}
              >
                Countries-wise Teams · {year}
              </p>
              <span className="text-[12px] font-medium" style={{ color: C.faint }}>
                {stats.totalCountries} nations · {stats.totalTeams} teams
              </span>
            </div>
            <ParticipationWorldMap
              data={mapData}
              year={year}
              selectedName={selectedName}
              onSelect={onSelect}
            />
          </section>

          {/* Summary table */}
          <section className="rounded-2xl" style={cardStyle}>
            <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[15px] font-bold" style={{ color: C.text }}>
                All Countries Summary ({year})
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: C.faint }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country..."
                    aria-label="Search country"
                    className="h-9 w-[190px] rounded-lg pl-8 pr-3 text-[13px] outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${C.border}`,
                      color: C.text,
                    }}
                  />
                </div>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region | "all")}
                  aria-label="Filter by region"
                  className="h-9 rounded-lg px-2.5 text-[13px] outline-none"
                  style={{
                    background: "rgb(17,23,40)",
                    border: `1px solid ${C.border}`,
                    color: C.text,
                  }}
                >
                  <option value="all">All Regions</option>
                  {regionOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto px-1 pb-2">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr>
                    {["Rank", "Country", `Teams ${year}`, prevYear != null ? `vs ${prevYear}` : "Change", "First", "Participations", "Trend"].map(
                      (h, i) => (
                        <th
                          key={h}
                          className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] ${
                            i === 1 ? "text-left" : i === 0 ? "text-left" : "text-left"
                          }`}
                          style={{ color: C.faint }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-[13px]" style={{ color: C.muted }}>
                        No countries match these filters.
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((r) => {
                      const selected = r.c.name === selectedName;
                      const change =
                        prevYear != null ? r.count - teamsIn(r.c, prevYear) : null;
                      const trendValues = yearsAsc.map((y) => teamsIn(r.c, y));
                      return (
                        <tr
                          key={r.c.name}
                          onClick={() => onSelect(r.c.name)}
                          className="cursor-pointer transition-colors"
                          style={{
                            background: selected ? C.rowSelected : "transparent",
                            borderTop: `1px solid ${C.borderSoft}`,
                          }}
                        >
                          <td className="px-3 py-2.5 text-[13px] font-bold" style={{ color: C.muted }}>
                            {r.rank}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-2.5">
                              <CountryFlag
                                country={r.c.name}
                                className="h-4 w-6 shrink-0 rounded-[2px] border border-[rgba(255,255,255,0.14)]"
                              />
                              <span className="text-[13px] font-semibold" style={{ color: C.text }}>
                                {r.c.name}
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-[13px] font-bold tabular-nums" style={{ color: C.text }}>
                            {r.count}
                          </td>
                          <td className="px-3 py-2.5 text-[13px] font-semibold tabular-nums">
                            {change == null ? (
                              <span style={{ color: C.faint }}>—</span>
                            ) : (
                              <span style={{ color: change > 0 ? C.green : change < 0 ? C.red : C.muted }}>
                                {change > 0 ? "▲" : change < 0 ? "▼" : "▬"} {Math.abs(change)}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-[13px] tabular-nums" style={{ color: C.muted }}>
                            {r.c.firstYear}
                          </td>
                          <td className="px-3 py-2.5 text-[13px] tabular-nums" style={{ color: C.muted }}>
                            {r.c.totalParticipations}
                          </td>
                          <td className="px-3 py-2.5">
                            <Sparkline values={trendValues} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <CountryDetailPanel
              country={selectedCountry}
              year={year}
              rank={selectedCountry ? rankByName.get(selectedCountry.name) ?? null : null}
              onClose={() => setSelectedName(null)}
              onSelectYear={setYear}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
