/**
 * Aggregated International Participation dataset for the admin dashboard.
 *
 * This is the SAME real data the public site's International Participation map
 * uses, reshaped into a multi-year, per-country view:
 *
 *   1. Historical editions — `INTERNATIONAL_EDITIONS` (pats-content.ts), the
 *      app's official record of which nations fielded a contingent each edition
 *      (2017, 2020–2025). One national contingent per country per edition.
 *   2. The 2026 (9th PATS) roster — `PREDEFINED_PARTICIPANTS`
 *      (international-participants.ts), with real per-country contingent/observer
 *      counts.
 *   3. Live registrations — participants (role "user") who registered a unit or
 *      completed team registration, grouped by country and stamped with their
 *      registration year. Mirrors `/api/public/registered-countries` exactly.
 *
 * No fabricated numbers: every team counted here traces back to one of those
 * three real sources. If the database is unavailable the static sources are
 * still returned, so the dashboard never renders empty.
 */

import "server-only";

import {
  countryNameToIso2,
  normalizeCountryKey,
  type RegisteredCountry,
  type RegisteredTeam,
} from "@/lib/country-iso";
import { regionForIso2 } from "@/lib/country-region";
import type {
  CountryParticipation,
  InternationalParticipation,
} from "@/lib/international-participation-types";
import {
  mergeRegisteredCountries,
  PREDEFINED_PARTICIPANTS,
} from "@/lib/international-participants";
import { COUNTRY_NAMES, INTERNATIONAL_EDITIONS } from "@/lib/pats-content";
import { PARTICIPANT_ROLE } from "@/lib/auth-routes";
import { prisma } from "@/lib/prisma";

export type {
  CountryParticipation,
  InternationalParticipation,
} from "@/lib/international-participation-types";

/** Mutable accumulator keyed by ISO2 (or normalized name when no ISO2). */
type Accumulator = {
  iso2: string;
  name: string;
  byYear: Map<number, number>;
};

/**
 * Registered countries = the 2026 predefined roster merged with live DB
 * registrations. Kept identical to `src/app/api/public/registered-countries`
 * so the admin dashboard and the public map agree to the team.
 */
export async function getRegisteredCountries(): Promise<RegisteredCountry[]> {
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

    const dynamicCountries: RegisteredCountry[] = [...byCountry.entries()].map(
      ([country, teams]) => ({ country, teams })
    );

    return mergeRegisteredCountries(PREDEFINED_PARTICIPANTS, dynamicCountries);
  } catch {
    return mergeRegisteredCountries(PREDEFINED_PARTICIPANTS);
  }
}

/** Stable accumulator key: ISO2 when known, else the normalized name. */
function accumulatorKey(iso2: string, name: string): string {
  return iso2 || normalizeCountryKey(name);
}

/**
 * Build the full multi-year dataset from all three real sources.
 */
export async function getInternationalParticipation(): Promise<InternationalParticipation> {
  const acc = new Map<string, Accumulator>();

  const add = (iso2: string, name: string, year: number, teams: number) => {
    const key = accumulatorKey(iso2, name);
    const entry = acc.get(key) ?? { iso2, name, byYear: new Map() };
    // Prefer a resolved ISO2 / a clean first-seen name if this row lacks one.
    if (!entry.iso2 && iso2) entry.iso2 = iso2;
    if (!entry.name && name) entry.name = name;
    entry.byYear.set(year, (entry.byYear.get(year) ?? 0) + teams);
    acc.set(key, entry);
  };

  // 1) Historical editions — one contingent per country per edition year.
  for (const edition of INTERNATIONAL_EDITIONS) {
    for (const code of edition.countries) {
      add(code, COUNTRY_NAMES[code] ?? code, edition.year, 1);
    }
  }

  // 2 + 3) 2026 roster + live registrations, both carried by getRegisteredCountries.
  const registered = await getRegisteredCountries();
  for (const country of registered) {
    const iso2 = countryNameToIso2(country.country);
    for (const team of country.teams) {
      add(iso2, country.country, team.year, 1);
    }
  }

  const allYears = new Set<number>();
  const countries: CountryParticipation[] = [];

  for (const entry of acc.values()) {
    const years = [...entry.byYear.keys()].sort((a, b) => a - b);
    if (years.length === 0) continue;
    const byYear: Record<number, number> = {};
    let totalTeams = 0;
    for (const y of years) {
      const n = entry.byYear.get(y) ?? 0;
      byYear[y] = n;
      totalTeams += n;
      allYears.add(y);
    }
    countries.push({
      iso2: entry.iso2,
      name: entry.name,
      region: entry.iso2 ? regionForIso2(entry.iso2) : "Other",
      byYear,
      years,
      firstYear: years[0],
      totalTeams,
      totalParticipations: years.length,
    });
  }

  countries.sort((a, b) => a.name.localeCompare(b.name));
  const years = [...allYears].sort((a, b) => b - a);

  return { years, countries };
}
