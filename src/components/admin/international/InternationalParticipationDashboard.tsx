"use client";

import { useCallback, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity, Download, Globe, Layers, Users } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { REGIONS, type Region } from "@/lib/country-region";
import type {
  InternationalParticipation,
  ParticipatingCountry,
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
  green: "rgb(74,222,128)",
  teal: "rgb(45,212,191)",
  lime: "rgb(132,204,22)",
  emerald: "rgb(52,211,153)",
};

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  hint: string;
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
        <p className="mt-1.5 text-[11px] font-medium leading-none" style={{ color: C.faint }}>
          {hint}
        </p>
      </div>
    </div>
  );
}

export function InternationalParticipationDashboard({
  data,
}: {
  data: InternationalParticipation;
}) {
  const { year, totalCountries, totalTeams } = data;

  const [region, setRegion] = useState<Region | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(() => {
    // Default-select the nation fielding the most teams.
    let best: ParticipatingCountry | null = null;
    for (const c of data.countries) {
      if (!best || c.teamCount > best.teamCount) best = c;
    }
    return best?.name ?? null;
  });

  // Nations ranked by team count (ties broken by name).
  const ranked = useMemo(
    () =>
      [...data.countries]
        .sort((a, b) => b.teamCount - a.teamCount || a.name.localeCompare(b.name))
        .map((c, i) => ({ c, rank: i + 1 })),
    [data.countries]
  );

  const rankByName = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of ranked) m.set(r.c.name, r.rank);
    return m;
  }, [ranked]);

  const avgTeams = totalCountries ? totalTeams / totalCountries : 0;
  const regionsRepresented = useMemo(
    () => new Set(data.countries.map((c) => c.region)).size,
    [data.countries]
  );

  const regionOptions = useMemo(() => {
    const present = new Set(data.countries.map((c) => c.region));
    return REGIONS.filter((r) => present.has(r));
  }, [data.countries]);

  const tableRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ranked.filter((r) => {
      if (region !== "all" && r.c.region !== region) return false;
      if (q && !r.c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [ranked, region, search]);

  const mapData: MapDatum[] = useMemo(
    () => data.countries.map((c) => ({ iso2: c.iso2, name: c.name, count: c.teamCount })),
    [data.countries]
  );

  const selectedCountry = useMemo(
    () => data.countries.find((c) => c.name === selectedName) ?? null,
    [data.countries, selectedName]
  );

  const onSelect = useCallback((name: string) => setSelectedName(name), []);

  const handleExport = useCallback(() => {
    const header = ["Rank", "Country", "Region", "Teams"];
    const body = tableRows.map((r) => [r.rank, r.c.name, r.c.region, r.c.teamCount]);
    const csv = [header, ...body].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `international-participation-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tableRows, year]);

  const cardStyle = { background: C.card, border: `1px solid ${C.border}` };

  return (
    <div
      className="intl-dash rounded-2xl p-4 sm:p-5"
      dir="ltr"
      style={{
        background: "linear-gradient(180deg, rgb(12,20,16) 0%, rgb(8,13,11) 100%)",
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
            Countries-wise teams on the world map · {year} edition
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 self-start rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors"
          style={{ border: `1px solid ${C.border}`, color: C.text }}
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </header>

      {/* Stat cards */}
      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Countries"
          value={String(totalCountries)}
          icon={Globe}
          accent={C.green}
          hint={`Nations in ${year}`}
        />
        <StatCard
          label="Total Teams"
          value={String(totalTeams)}
          icon={Users}
          accent={C.teal}
          hint="Contingents + observers"
        />
        <StatCard
          label="Avg Teams / Country"
          value={avgTeams.toFixed(1)}
          icon={Activity}
          accent={C.lime}
          hint="Across all nations"
        />
        <StatCard
          label="Regions Represented"
          value={String(regionsRepresented)}
          icon={Layers}
          accent={C.emerald}
          hint="World regions"
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
                {totalCountries} nations · {totalTeams} teams
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
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  aria-label="Search country"
                  className="h-9 w-[180px] rounded-lg px-3 text-[13px] outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${C.border}`,
                    color: C.text,
                  }}
                />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region | "all")}
                  aria-label="Filter by region"
                  className="h-9 rounded-lg px-2.5 text-[13px] outline-none"
                  style={{
                    background: "rgb(15,25,19)",
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
              <table className="w-full min-w-[460px] border-collapse">
                <thead>
                  <tr>
                    {["Rank", "Country", `Teams ${year}`, "Region"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em]"
                        style={{ color: C.faint }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-8 text-center text-[13px]"
                        style={{ color: C.muted }}
                      >
                        No countries match these filters.
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((r) => {
                      const selected = r.c.name === selectedName;
                      return (
                        <tr
                          key={r.c.name}
                          onClick={() => onSelect(r.c.name)}
                          className={`cursor-pointer${selected ? " intl-row-active" : ""}`}
                          style={{ borderTop: `1px solid ${C.borderSoft}` }}
                        >
                          <td
                            className="px-3 py-2.5 text-[13px] font-bold"
                            style={{ color: C.muted }}
                          >
                            {r.rank}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-2.5">
                              <CountryFlag
                                country={r.c.name}
                                className="h-4 w-6 shrink-0 rounded-[2px] border border-[rgba(255,255,255,0.14)]"
                              />
                              <span
                                className="text-[13px] font-semibold"
                                style={{ color: C.text }}
                              >
                                {r.c.name}
                              </span>
                            </span>
                          </td>
                          <td
                            className="px-3 py-2.5 text-[13px] font-bold tabular-nums"
                            style={{ color: C.green }}
                          >
                            {r.c.teamCount}
                          </td>
                          <td
                            className="px-3 py-2.5 text-[13px]"
                            style={{ color: C.muted }}
                          >
                            {r.c.region}
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
