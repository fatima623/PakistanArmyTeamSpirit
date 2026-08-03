/**
 * Aggregated International Participation dataset for the admin dashboard.
 *
 * This is the SAME data the public site's International Participation map uses,
 * reshaped per-country:
 *   - The 2026 (9th PATS) roster — `PREDEFINED_PARTICIPANTS`
 *     (international-participants.ts), with real per-country contingent/observer
 *     counts, and
 *   - Live registrations — participants (role "user") who registered a unit or
 *     completed team registration, grouped by country. Mirrors
 *     `/api/public/registered-countries` exactly.
 *
 * It is a single edition only (no historical multi-year data). No fabricated
 * numbers: every team counted here comes from the website's own data. If the
 * database is unavailable the predefined roster is still returned, so the
 * dashboard never renders empty.
 */

import "server-only";

import {
  countryNameToIso2,
  type RegisteredCountry,
  type RegisteredTeam,
} from "@/lib/country-iso";
import { regionForIso2 } from "@/lib/country-region";
import type {
  InternationalParticipation,
  ParticipatingCountry,
} from "@/lib/international-participation-types";
import {
  mergeRegisteredCountries,
  PREDEFINED_PARTICIPANTS,
} from "@/lib/international-participants";
import { PARTICIPANT_ROLE } from "@/lib/auth-routes";
import { prisma } from "@/lib/prisma";

export type {
  InternationalParticipation,
  ParticipatingCountry,
} from "@/lib/international-participation-types";

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

/**
 * Build the current-edition dataset straight from the website's registered
 * countries — one entry per nation, with its team labels and count.
 */
export async function getInternationalParticipation(): Promise<InternationalParticipation> {
  const registered = await getRegisteredCountries();

  let year = 0;
  const countries: ParticipatingCountry[] = [];

  for (const c of registered) {
    if (c.teams.length === 0) continue;
    const iso2 = countryNameToIso2(c.country);
    for (const t of c.teams) {
      if (t.year > year) year = t.year;
    }
    countries.push({
      iso2,
      name: c.country,
      region: iso2 ? regionForIso2(iso2) : "Other",
      teamCount: c.teams.length,
      teams: c.teams.map((t) => t.name),
    });
  }

  countries.sort((a, b) => a.name.localeCompare(b.name));
  const totalTeams = countries.reduce((sum, c) => sum + c.teamCount, 0);

  return {
    year: year || new Date().getFullYear(),
    totalTeams,
    totalCountries: countries.length,
    countries,
  };
}
