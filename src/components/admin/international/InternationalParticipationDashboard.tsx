"use client";

import { useCallback, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity, CalendarRange, Download, Globe, Layers, Users } from "lucide-react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { REGIONS, type Region } from "@/lib/country-region";
import type {
  EditionParticipation,
  InternationalParticipation,
  ParticipatingCountry,
} from "@/lib/international-participation-types";

import { CountryDetailPanel, type CountryEdition } from "./CountryDetailPanel";
import { ParticipationWorldMap, type MapDatum } from "./ParticipationWorldMap";

/** "All editions" sentinel for the year filter. */
const ALL = "all" as const;
type YearFilter = number | typeof ALL;

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
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

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "green" | "teal" | "lime" | "moss";
  hint: string;
}) {
  return (
    <div className="intl-stat">
      <span className={`intl-stat__icon intl-stat__icon--${tone}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="intl-stat__label">{label}</p>
        <p className="intl-stat__value">{value}</p>
        <p className="intl-stat__hint">{hint}</p>
      </div>
    </div>
  );
}

/** One country rolled up across every edition it appeared in. */
function aggregateAllEditions(
  editions: EditionParticipation[]
): ParticipatingCountry[] {
  const byName = new Map<string, ParticipatingCountry>();
  for (const ed of editions) {
    for (const c of ed.countries) {
      const existing = byName.get(c.name);
      if (existing) {
        existing.teamCount += c.teamCount;
        existing.teams = existing.teams.concat(
          c.teams.map((t) => `${t} (${ed.year})`)
        );
      } else {
        byName.set(c.name, {
          ...c,
          teams: c.teams.map((t) => `${t} (${ed.year})`),
        });
      }
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function InternationalParticipationDashboard({
  data,
}: {
  data: InternationalParticipation;
}) {
  const editions = data.editions;
  const years = useMemo(() => editions.map((e) => e.year), [editions]);

  const [year, setYear] = useState<YearFilter>(data.year);
  const [region, setRegion] = useState<Region | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);

  /** The edition currently in focus, or null when showing every edition. */
  const activeEdition = useMemo(
    () => (year === ALL ? null : editions.find((e) => e.year === year) ?? null),
    [editions, year]
  );

  /** Countries in scope: one edition's roster, or every nation ever. */
  const scopedCountries = useMemo(
    () =>
      activeEdition
        ? activeEdition.countries
        : aggregateAllEditions(editions),
    [activeEdition, editions]
  );

  /** Editions each country appeared in, newest first — powers the detail panel. */
  const historyByCountry = useMemo(() => {
    const m = new Map<string, CountryEdition[]>();
    for (const ed of editions) {
      for (const c of ed.countries) {
        const list = m.get(c.name) ?? [];
        list.push({ year: ed.year, edition: ed.edition, teams: c.teams });
        m.set(c.name, list);
      }
    }
    for (const list of m.values()) list.sort((a, b) => b.year - a.year);
    return m;
  }, [editions]);

  const periodLabel =
    year === ALL
      ? years.length > 1
        ? `${Math.min(...years)}–${Math.max(...years)}`
        : String(years[0] ?? data.year)
      : String(year);

  const totalCountries = scopedCountries.length;
  const totalTeams = activeEdition
    ? activeEdition.totalTeams
    : scopedCountries.reduce((n, c) => n + c.teamCount, 0);
  const avgTeams = totalCountries ? totalTeams / totalCountries : 0;
  const regionsRepresented = useMemo(
    () => new Set(scopedCountries.map((c) => c.region)).size,
    [scopedCountries]
  );

  const regionOptions = useMemo(() => {
    const present = new Set(scopedCountries.map((c) => c.region));
    return REGIONS.filter((r) => present.has(r));
  }, [scopedCountries]);

  /** Ranks within the current scope (ties broken by name). */
  const rankByName = useMemo(() => {
    const m = new Map<string, number>();
    [...scopedCountries]
      .sort((a, b) => b.teamCount - a.teamCount || a.name.localeCompare(b.name))
      .forEach((c, i) => m.set(c.name, i + 1));
    return m;
  }, [scopedCountries]);

  const matchesFilters = useCallback(
    (c: ParticipatingCountry) => {
      const q = search.trim().toLowerCase();
      if (region !== "all" && c.region !== region) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    },
    [region, search]
  );

  /**
   * Summary rows, newest edition first. With "All editions" selected the table
   * is grouped year-by-year (2026 on top, then 2025, …) so the year-wise split
   * is visible at a glance; a single-year filter renders one ranked group.
   */
  const groups = useMemo(() => {
    const source = activeEdition ? [activeEdition] : editions;
    return source
      .map((ed) => {
        const rows = [...ed.countries]
          .filter(matchesFilters)
          .sort(
            (a, b) => b.teamCount - a.teamCount || a.name.localeCompare(b.name)
          )
          .map((c, i) => ({ c, rank: i + 1 }));
        return { edition: ed, rows };
      })
      .filter((g) => g.rows.length > 0);
  }, [activeEdition, editions, matchesFilters]);

  const hasRows = groups.some((g) => g.rows.length > 0);

  const mapData: MapDatum[] = useMemo(
    () =>
      scopedCountries.map((c) => ({
        iso2: c.iso2,
        name: c.name,
        count: c.teamCount,
      })),
    [scopedCountries]
  );

  const selectedCountry = useMemo(
    () => scopedCountries.find((c) => c.name === selectedName) ?? null,
    [scopedCountries, selectedName]
  );

  const onSelect = useCallback((name: string) => setSelectedName(name), []);

  const handleExport = useCallback(() => {
    const header = ["Year", "Edition", "Rank", "Country", "Region", "Teams"];
    const body = groups.flatMap((g) =>
      g.rows.map((r) => [
        g.edition.year,
        g.edition.edition > 0 ? `${ordinal(g.edition.edition)} Intl` : "—",
        r.rank,
        r.c.name,
        r.c.region,
        r.c.teamCount,
      ])
    );
    const csv = [header, ...body].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `international-participation-${
      year === ALL ? "all-editions" : year
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [groups, year]);

  return (
    <div className="intl-dash" dir="ltr">
      {/* Header */}
      <header className="intl-dash__header">
        <div>
          <h1 className="intl-dash__title">International Participation</h1>
          <p className="intl-dash__subtitle">
            Countries-wise teams on the world map ·{" "}
            {activeEdition
              ? `${ordinal(activeEdition.edition)} Intl PATS · ${activeEdition.month} ${activeEdition.year}`
              : `all editions · ${periodLabel}`}
          </p>
        </div>
        <button type="button" onClick={handleExport} className="intl-btn">
          <Download className="h-4 w-4" aria-hidden />
          Export Report
        </button>
      </header>

      {/* Year filter — drives the whole page: stats, map, table and detail panel. */}
      <section className="intl-years" aria-label="Filter by edition year">
        <span className="intl-years__label">
          <CalendarRange className="h-4 w-4" aria-hidden />
          Edition
        </span>
        <div className="intl-years__chips">
          <button
            type="button"
            onClick={() => setYear(ALL)}
            aria-pressed={year === ALL}
            className="intl-year-chip"
            data-active={year === ALL}
          >
            All editions
          </button>
          {editions.map((ed) => (
            <button
              key={ed.year}
              type="button"
              onClick={() => setYear(ed.year)}
              aria-pressed={year === ed.year}
              className="intl-year-chip"
              data-active={year === ed.year}
              title={
                ed.edition > 0
                  ? `${ordinal(ed.edition)} International PATS — ${ed.month} ${ed.year}`
                  : `${ed.year} registrations`
              }
            >
              {ed.year}
            </button>
          ))}
        </div>
      </section>

      {/* Stat cards */}
      <section className="intl-stats">
        <StatCard
          label="Total Countries"
          value={String(totalCountries)}
          icon={Globe}
          tone="green"
          hint={year === ALL ? "Nations across all editions" : `Nations in ${year}`}
        />
        <StatCard
          label="Total Teams"
          value={String(totalTeams)}
          icon={Users}
          tone="teal"
          hint="Contingents + observers"
        />
        <StatCard
          label="Avg Teams / Country"
          value={avgTeams.toFixed(1)}
          icon={Activity}
          tone="lime"
          hint={`Across ${periodLabel}`}
        />
        <StatCard
          label="Regions Represented"
          value={String(regionsRepresented)}
          icon={Layers}
          tone="moss"
          hint="World regions"
        />
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Map */}
          <section className="intl-card">
            <div className="intl-card__head">
              <p className="intl-card__eyebrow">
                Countries-wise Teams · {periodLabel}
              </p>
              <span className="intl-card__meta">
                {totalCountries} nations · {totalTeams} teams
              </span>
            </div>
            <ParticipationWorldMap
              data={mapData}
              label={periodLabel}
              selectedName={selectedName}
              onSelect={onSelect}
            />
          </section>

          {/* Summary table — newest edition first */}
          <section className="intl-card">
            <div className="intl-card__toolbar">
              <h2 className="intl-card__title">
                All Countries Summary ({periodLabel})
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  aria-label="Search country"
                  className="intl-input"
                />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region | "all")}
                  aria-label="Filter by region"
                  className="intl-select"
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

            <div className="intl-table-wrap">
              <table className="intl-table">
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Country</th>
                    <th scope="col">Teams</th>
                    <th scope="col">Region</th>
                  </tr>
                </thead>
                {hasRows ? (
                  groups.map((g) => (
                    <tbody key={g.edition.year}>
                      <tr className="intl-table__group">
                        <th scope="colgroup" colSpan={4}>
                          <span className="intl-table__group-year">
                            {g.edition.year}
                          </span>
                          {g.edition.edition > 0 ? (
                            <span className="intl-table__group-edition">
                              {ordinal(g.edition.edition)} International PATS ·{" "}
                              {g.edition.month} {g.edition.year}
                            </span>
                          ) : (
                            <span className="intl-table__group-edition">
                              Registrations
                            </span>
                          )}
                          <span className="intl-table__group-count">
                            {g.edition.totalCountries} nations ·{" "}
                            {g.edition.totalTeams} teams
                            {g.edition.teamsUnattributed
                              ? " (official total; per-nation split not published)"
                              : ""}
                          </span>
                        </th>
                      </tr>
                      {g.rows.map((r) => (
                        <tr
                          key={`${g.edition.year}-${r.c.name}`}
                          onClick={() => onSelect(r.c.name)}
                          className="intl-table__row"
                          data-selected={r.c.name === selectedName}
                        >
                          <td className="intl-table__rank">{r.rank}</td>
                          <td>
                            <span className="intl-table__country">
                              <CountryFlag
                                country={r.c.name}
                                className="intl-table__flag"
                              />
                              <span className="intl-table__name">{r.c.name}</span>
                            </span>
                          </td>
                          <td className="intl-table__teams">{r.c.teamCount}</td>
                          <td className="intl-table__region">{r.c.region}</td>
                        </tr>
                      ))}
                    </tbody>
                  ))
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={4} className="intl-table__empty">
                        No countries match these filters.
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </section>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <CountryDetailPanel
              country={selectedCountry}
              periodLabel={periodLabel}
              rank={
                selectedCountry ? rankByName.get(selectedCountry.name) ?? null : null
              }
              history={
                selectedCountry
                  ? historyByCountry.get(selectedCountry.name) ?? []
                  : []
              }
              onClose={() => setSelectedName(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
