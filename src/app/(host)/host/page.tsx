import type { Metadata } from "next";
import Link from "next/link";
import { Building2, FileCheck2, Globe2, Users2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireHostSession } from "@/lib/require-host";
import { formatDateShort } from "@/lib/utils";
import { displayCountry } from "@/lib/participant-country";
import {
  adminDataTable,
  adminDataTableShell,
  adminTableActionsCenter,
  adminTableEmpty,
  adminTableHead,
  portalTableActionView,
} from "@/lib/admin-ui";

export const metadata: Metadata = {
  title: "Host Dashboard",
};

/** x/y coverage pill — green only when every roster member is covered. */
function CoveragePill({
  done,
  total,
  label,
}: {
  done: number;
  total: number;
  label: string;
}) {
  const complete = total > 0 && done === total;
  return (
    <span
      aria-label={`${label}: ${done} of ${total}`}
      className={
        complete
          ? "inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[12px] font-bold tabular-nums text-green-700"
          : "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[12px] font-bold tabular-nums text-amber-700"
      }
    >
      {done}/{total}
    </span>
  );
}

/**
 * Compact stat tile.
 *
 * NB: type sizes here use arbitrary values on purpose. Inside
 * `.admin-theme.pats-dashboard` (this route group's shell) globals.css
 * force-rewrites the Tailwind scale — `text-xl/2xl/3xl` all become the 44px
 * display size and `text-sm/base` collapse to one body size. Arbitrary values
 * (`text-[1.375rem]`) are not matched by those `[class~="…"]` selectors, so
 * they survive. Use `admin-page-title` / `admin-muted` for semantic headings.
 */
function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[1.375rem] font-bold leading-none tabular-nums tracking-[-0.01em] text-slate-900">
          {value}
        </p>
        <p className="m-0 mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * One country in the "Teams by country" panel.
 *
 * `missing` rows (participants with no country on file) are amber: the host
 * coordinates arrivals by nation, so a country-less team is a data gap they
 * should chase with the organizing administration, not a benign zero.
 *
 * Same type-scale caveat as `Stat` above — arbitrary sizes only in here.
 */
function CountryTally({
  label,
  teams,
  participants,
  share,
  missing,
}: {
  label: string;
  teams: number;
  participants: number;
  /** Participant share of the formation, 0–1, for the proportion bar. */
  share: number;
  missing: boolean;
}) {
  return (
    <div
      className={
        missing
          ? "rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5"
          : "rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      }
    >
      <p
        className={
          missing
            ? "m-0 truncate text-[0.8125rem] font-bold text-amber-800"
            : "m-0 truncate text-[0.8125rem] font-bold text-slate-900"
        }
        title={label}
      >
        {label}
      </p>
      <p
        className={
          missing
            ? "m-0 mt-1 text-[0.75rem] tabular-nums text-amber-700"
            : "m-0 mt-1 text-[0.75rem] tabular-nums text-slate-500"
        }
      >
        {teams} {teams === 1 ? "team" : "teams"} · {participants}{" "}
        {participants === 1 ? "participant" : "participants"}
      </p>
      <div
        aria-hidden
        className={
          missing
            ? "mt-2 h-1 w-full overflow-hidden rounded-full bg-amber-200"
            : "mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100"
        }
      >
        <div
          className={missing ? "h-full bg-amber-500" : "h-full bg-green-600"}
          style={{ width: `${Math.round(share * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default async function HostDashboardPage() {
  const session = await requireHostSession();

  const formation = await prisma.hostFormation.findUnique({
    where: { hostUserId: session.user.id },
    select: { id: true, name: true, notes: true },
  });

  if (!formation) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-[0.875rem] text-amber-800">
        Your account is not linked to a host formation yet. Please contact the
        organizing administration.
      </div>
    );
  }

  const [teams, completeByTeam] = await Promise.all([
    prisma.user.findMany({
      where: { hostFormationId: formation.id },
      orderBy: [{ unit: { unitName: "asc" } }, { lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rank: true,
        country: true,
        nationality: true,
        finalizedForHostAt: true,
        unit: { select: { unitName: true, unitType: true, branch: true } },
        teamMembers: { select: { id: true, flightDetail: { select: { id: true } } } },
      },
    }),
    /**
     * "Documented" is decided the same way everywhere else in the app —
     * isFlightRecordComplete: BOTH stored files present. The check runs in the
     * DB `where` so the file paths are never selected into a host page, and the
     * tally is counted from the TeamMember side so a legacy orphan record
     * (teamMemberId = null) cannot fake coverage for a member who filed nothing.
     */
    prisma.teamMember.groupBy({
      by: ["userId"],
      where: {
        user: { hostFormationId: formation.id },
        flightDetail: {
          is: {
            passportFilePath: { not: null },
            ticketFilePath: { not: null },
          },
        },
      },
      _count: { _all: true },
    }),
  ]);

  const completeCounts = new Map(
    completeByTeam.map((g) => [g.userId, g._count._all])
  );

  const rows = teams.map((team) => {
    const memberCount = team.teamMembers.length;
    const flightsOnFile = team.teamMembers.filter((m) => m.flightDetail).length;
    const docsComplete = completeCounts.get(team.id) ?? 0;
    return {
      ...team,
      memberCount,
      flightsOnFile,
      docsComplete,
      fullyDocumented: memberCount > 0 && docsComplete === memberCount,
    };
  });

  const totalMembers = rows.reduce((sum, r) => sum + r.memberCount, 0);
  const fullyDocumentedTeams = rows.filter((r) => r.fullyDocumented).length;

  /**
   * National spread of the formation. Folded out of `rows` rather than a second
   * `prisma.user.groupBy({ by: ["country"] })` — the rows are already in hand,
   * and a groupBy could only count teams anyway: the participant headcount the
   * host actually plans arrivals around lives on the roster side.
   *
   * Countries are matched on their trimmed value, so `null` / `""` / `"  "`
   * collapse into one "Not set" bucket instead of masquerading as separate
   * nations. Ordered by team count (mirroring the participant-facing
   * /event/host-info breakdown), with the gap bucket kept last on ties.
   */
  const countryTally = [
    ...rows
      .reduce((acc, team) => {
        const country = team.country?.trim() || null;
        const key = country ?? "";
        const entry = acc.get(key) ?? { country, teams: 0, participants: 0 };
        entry.teams += 1;
        entry.participants += team.memberCount;
        acc.set(key, entry);
        return acc;
      }, new Map<string, { country: string | null; teams: number; participants: number }>())
      .values(),
  ].sort(
    (a, b) =>
      b.teams - a.teams ||
      b.participants - a.participants ||
      // A country-less bucket never outranks a named one on a tie.
      Number(a.country === null) - Number(b.country === null) ||
      (a.country ?? "").localeCompare(b.country ?? "")
  );

  /** Real nations only — the "Not set" bucket is a data gap, not a country. */
  const namedCountryCount = countryTally.filter((e) => e.country !== null).length;

  return (
    <div className="flex flex-col gap-5">
      {/* —— Formation header —————————————————————————————— */}
      <section className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <Building2 size={20} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="admin-page-title m-0">{formation.name}</h1>
            <p className="m-0 mt-0.5 text-[0.8125rem] text-slate-500">
              {rows.length} {rows.length === 1 ? "team" : "teams"} ·{" "}
              {totalMembers} participants assigned
            </p>
          </div>
        </div>
        {formation.notes ? (
          <p className="m-0 mt-3 rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-[0.8125rem] text-slate-600">
            {formation.notes}
          </p>
        ) : null}
      </section>

      {/* —— Stat strip ——————————————————————————————————— */}
      <section className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
        <Stat
          icon={<Building2 size={17} aria-hidden />}
          value={rows.length}
          label="Teams assigned"
        />
        <Stat
          icon={<Users2 size={17} aria-hidden />}
          value={totalMembers}
          label="Participants"
        />
        <Stat
          icon={<FileCheck2 size={17} aria-hidden />}
          value={fullyDocumentedTeams}
          label="Fully documented"
        />
      </section>

      {/* —— Teams by country ————————————————————————————— */}
      {countryTally.length > 0 ? (
        <section className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe2
                size={16}
                aria-hidden
                className="flex-shrink-0 text-green-700"
              />
              <h2 className="m-0 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900">
                Teams by country
              </h2>
            </div>
            <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-slate-500">
              {/* The "Not set" bucket is a data gap, not a nation — counting it
                  as one reported "2 countries" for a formation holding teams
                  from a single country plus some with no country on file. */}
              {namedCountryCount}{" "}
              {namedCountryCount === 1 ? "country" : "countries"}
            </p>
          </div>
          <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(170px,1fr))]">
            {countryTally.map((entry) => (
              <CountryTally
                key={entry.country ?? "__unset__"}
                label={
                  entry.country ? displayCountry(entry.country) : "Not set"
                }
                teams={entry.teams}
                participants={entry.participants}
                share={
                  totalMembers > 0 ? entry.participants / totalMembers : 0
                }
                missing={entry.country === null}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* —— Teams table —————————————————————————————————— */}
      <section className={adminDataTableShell}>
        <div className="overflow-x-auto">
        <table className={`${adminDataTable} min-w-[720px]`}>
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead className={adminTableHead}>
            <tr>
              <th scope="col">Unit</th>
              <th scope="col">Captain</th>
              <th scope="col">Country</th>
              <th scope="col">Members</th>
              <th scope="col">Flights</th>
              <th scope="col">Docs</th>
              <th scope="col">Finalized</th>
              <th scope="col">View</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className={adminTableEmpty}>
                  No teams have been assigned to your formation yet.
                </td>
              </tr>
            ) : (
              rows.map((team) => (
                <tr key={team.id}>
                  <td className="text-left">
                    <div className="font-semibold text-brand-ink">
                      {team.unit?.unitName ||
                        `${team.firstName} ${team.lastName}`}
                    </div>
                    {team.unit ? (
                      <div className="mt-0.5 text-[0.8125rem] leading-snug text-muted-foreground">
                        {[team.unit.unitType, team.unit.branch]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    ) : null}
                  </td>
                  <td className="text-left">
                    <div className="font-medium text-brand-ink">
                      {team.firstName} {team.lastName}
                    </div>
                    {team.rank ? (
                      <div className="text-[0.8125rem] text-muted-foreground">
                        {team.rank}
                      </div>
                    ) : null}
                  </td>
                  <td className="text-muted-foreground">
                    <div>{displayCountry(team.country)}</div>
                    {team.nationality?.trim() ? (
                      <div className="text-[0.8125rem]">{team.nationality}</div>
                    ) : null}
                  </td>
                  <td className="tabular-nums text-muted-foreground">
                    {team.memberCount}
                  </td>
                  <td>
                    <CoveragePill
                      done={team.flightsOnFile}
                      total={team.memberCount}
                      label="Flight records on file"
                    />
                  </td>
                  <td>
                    <CoveragePill
                      done={team.docsComplete}
                      total={team.memberCount}
                      label="Members with both documents"
                    />
                  </td>
                  <td className="tabular-nums text-muted-foreground">
                    {team.finalizedForHostAt
                      ? formatDateShort(team.finalizedForHostAt)
                      : "—"}
                  </td>
                  <td>
                    <div className={adminTableActionsCenter}>
                      <Link
                        href={`/host/teams/${team.id}`}
                        className={portalTableActionView}
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}
