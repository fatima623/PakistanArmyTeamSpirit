/**
 * Aggregated International Participation dataset for the admin dashboard.
 *
 * This is the SAME data the public site's International Participation map uses,
 * reshaped per-edition and then per-country:
 *   - Every International PATS edition — `PATS_EDITIONS`
 *     (international-editions.ts), from the 1st Intl (Mar 2016) through the
 *     9th Intl (2026) roster, with real per-country contingent/observer counts,
 *     and
 *   - Live registrations — participants (role "user") who registered a unit or
 *     completed team registration, grouped by country and bucketed into the
 *     edition year they registered in. Mirrors
 *     `/api/public/registered-countries` exactly.
 *
 * No fabricated numbers: every team counted here comes from the official
 * participation slides or the website's own data. If the database is
 * unavailable the static edition history is still returned, so the dashboard
 * never renders empty.
 */

import "server-only";

import {
  countryNameToIso2,
  type RegisteredCountry,
  type RegisteredTeam,
} from "@/lib/country-iso";
import { regionForIso2 } from "@/lib/country-region";
import {
  CURRENT_EDITION_YEAR,
  editionTeamCount,
  PATS_EDITIONS,
} from "@/lib/international-editions";
import type {
  EditionParticipation,
  InternationalParticipation,
  ParticipatingCountry,
} from "@/lib/international-participation-types";
import {
  editionToRegisteredCountries,
  HISTORICAL_PARTICIPANTS,
  mergeRegisteredCountries,
  PREDEFINED_PARTICIPANTS,
} from "@/lib/international-participants";
import { PARTICIPANT_ROLE } from "@/lib/auth-routes";
import { prisma } from "@/lib/prisma";

export type {
  EditionParticipation,
  InternationalParticipation,
  ParticipatingCountry,
} from "@/lib/international-participation-types";

/** Live, DB-derived teams grouped by country (empty when the DB is down). */
async function getLiveCountries(): Promise<RegisteredCountry[]> {
  try {
    const users = await prisma.user.findMany({
      where: { role: PARTICIPANT_ROLE, country: { not: null } },
      select: {
        country: true,
        createdAt: true,
        teamRegisteredAt: true,
        unit: { select: { unitName: true } },
      },
    });

    const byCountry = new Map<string, RegisteredTeam[]>();
    for (const u of users) {
      const country = (u.country ?? "").trim();
      if (!country) continue;
      // A registered team has a unit or has completed team registration.
      if (!u.unit && !u.teamRegisteredAt) continue;
      const name = u.unit?.unitName?.trim() || "Registered team";
      const when = u.teamRegisteredAt ?? u.createdAt;
      const year = new Date(when).getFullYear();
      const list = byCountry.get(country) ?? [];
      list.push({ name, year });
      byCountry.set(country, list);
    }

    return [...byCountry.entries()].map(([country, teams]) => ({
      country,
      teams,
    }));
  } catch {
    return [];
  }
}

/**
 * Registered countries = the full edition history merged with live DB
 * registrations. Kept identical to `src/app/api/public/registered-countries`
 * so the admin dashboard and the public map agree to the team.
 */
export async function getRegisteredCountries(): Promise<RegisteredCountry[]> {
  const live = await getLiveCountries();
  return mergeRegisteredCountries(
    PREDEFINED_PARTICIPANTS,
    HISTORICAL_PARTICIPANTS,
    live
  );
}

/** Turn one edition's `RegisteredCountry[]` into ranked `ParticipatingCountry[]`. */
function toParticipatingCountries(
  countries: RegisteredCountry[]
): ParticipatingCountry[] {
  const out: ParticipatingCountry[] = [];
  for (const c of countries) {
    if (c.teams.length === 0) continue;
    const iso2 = countryNameToIso2(c.country);
    out.push({
      iso2,
      name: c.country,
      region: iso2 ? regionForIso2(iso2) : "Other",
      teamCount: c.teams.length,
      teams: c.teams.map((t) => t.name),
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/**
 * Build the year-wise dataset: one entry per International PATS edition, newest
 * first, with live registrations folded into the edition year they belong to.
 */
export async function getInternationalParticipation(): Promise<InternationalParticipation> {
  const live = await getLiveCountries();

  // Live teams bucketed by the year they registered in, so a 2026 sign-up lands
  // on the 2026 edition and never inflates a historic one.
  const liveByYear = new Map<number, RegisteredCountry[]>();
  for (const c of live) {
    for (const t of c.teams) {
      const bucket = liveByYear.get(t.year) ?? [];
      bucket.push({ country: c.country, teams: [t] });
      liveByYear.set(t.year, bucket);
    }
  }

  const editions: EditionParticipation[] = PATS_EDITIONS.slice()
    .sort((a, b) => b.year - a.year)
    .map((edition) => {
      const merged = mergeRegisteredCountries(
        editionToRegisteredCountries(edition),
        liveByYear.get(edition.year) ?? []
      );
      const countries = toParticipatingCountries(merged);
      const attributed = countries.reduce((n, c) => n + c.teamCount, 0);
      const official = editionTeamCount(edition);
      return {
        edition: edition.edition,
        year: edition.year,
        month: edition.month,
        totalTeams: Math.max(attributed, official),
        totalCountries: countries.length,
        teamsUnattributed: official > attributed,
        countries,
      };
    });

  // Any live registration from a year with no PATS edition on record still
  // deserves a bucket, so nothing registered through the admin panel is lost.
  const knownYears = new Set(editions.map((e) => e.year));
  for (const [year, entries] of liveByYear) {
    if (knownYears.has(year)) continue;
    const countries = toParticipatingCountries(
      mergeRegisteredCountries(entries)
    );
    if (countries.length === 0) continue;
    editions.push({
      edition: 0,
      year,
      month: "",
      totalTeams: countries.reduce((n, c) => n + c.teamCount, 0),
      totalCountries: countries.length,
      teamsUnattributed: false,
      countries,
    });
  }
  editions.sort((a, b) => b.year - a.year);

  const current =
    editions.find((e) => e.year === CURRENT_EDITION_YEAR) ?? editions[0]!;

  return {
    year: current.year,
    totalTeams: current.totalTeams,
    totalCountries: current.totalCountries,
    countries: current.countries,
    editions,
  };
}
