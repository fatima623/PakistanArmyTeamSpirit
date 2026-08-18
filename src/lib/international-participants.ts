/**
 * PATS participating nations shown on the International Participation map,
 * derived from the edition history in `international-editions.ts`.
 *
 * Two exports feed the map:
 *   - `PREDEFINED_PARTICIPANTS` — the current-edition (9th PATS) contingents
 *     and observers.
 *   - `HISTORICAL_PARTICIPANTS` — every previous edition (1st Intl 2016 →
 *     8th Intl 2025), so the map and the admin dashboard carry the full
 *     year-wise record rather than a single edition.
 *
 * The map merges both with the live, DB-derived list from
 * `/api/public/registered-countries`, so:
 *   - the map always initialises with these nations (even before anyone
 *     registers, and even if the database is unavailable), and
 *   - any country added later through the admin panel / database appears
 *     automatically — no code change required.
 *
 * Every country name resolves through `COUNTRY_NAME_TO_ISO2`, so each one has a
 * flag and a `world.svg` shape.
 */

import {
  countryNameToIso2,
  normalizeCountryKey,
  type RegisteredCountry,
  type RegisteredTeam,
} from "@/lib/country-iso";
import {
  CURRENT_EDITION,
  CURRENT_EDITION_YEAR,
  PATS_EDITIONS,
  type EditionCountry,
  type PatsEdition,
} from "@/lib/international-editions";

export { CURRENT_EDITION_YEAR };

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** Team labels for one nation in one edition (contingents, then observers). */
export function editionTeamNames(entry: EditionCountry): string[] {
  const names: string[] = [];
  if (entry.contingents === 1) {
    names.push("National contingent");
  } else {
    for (let i = 0; i < entry.contingents; i += 1) {
      names.push(`National contingent ${ROMAN[i] ?? i + 1}`);
    }
  }
  if (entry.observer) names.push("Observer delegation");
  return names;
}

/** One edition as the `RegisteredCountry[]` shape the map consumes. */
export function editionToRegisteredCountries(
  edition: PatsEdition
): RegisteredCountry[] {
  return edition.countries.map((c) => ({
    country: c.country,
    teams: editionTeamNames(c).map(
      (name): RegisteredTeam => ({ name, year: edition.year })
    ),
  }));
}

/** 9th PATS roster — contingents and observers for the current edition. */
export const PREDEFINED_PARTICIPANTS: RegisteredCountry[] =
  editionToRegisteredCountries(CURRENT_EDITION);

/** Every previous edition (1st Intl 2016 → 8th Intl 2025), newest first. */
export const HISTORICAL_PARTICIPANTS: RegisteredCountry[] =
  mergeRegisteredCountries(
    ...PATS_EDITIONS.filter((e) => e.year !== CURRENT_EDITION_YEAR)
      .slice()
      .sort((a, b) => b.year - a.year)
      .map(editionToRegisteredCountries)
  );

/** Stable identity for a country: its ISO-2 code, or its normalised name. */
function countryKey(name: string): string {
  return countryNameToIso2(name) || normalizeCountryKey(name);
}

/** De-duplicate teams by name + year, preserving first-seen order. */
function dedupeTeams(teams: RegisteredTeam[]): RegisteredTeam[] {
  const seen = new Set<string>();
  const out: RegisteredTeam[] = [];
  for (const t of teams) {
    const k = `${normalizeCountryKey(t.name)}|${t.year}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

/**
 * Merge several country lists into one, keyed by ISO-2 (falling back to the
 * normalised name). Countries appearing in more than one list are combined into
 * a single entry whose teams are the union of all sources — so a nation that
 * took part in several editions shows every year's teams under one country
 * marker. The first list's display name wins for a given key.
 */
export function mergeRegisteredCountries(
  ...lists: RegisteredCountry[][]
): RegisteredCountry[] {
  const byKey = new Map<string, RegisteredCountry>();
  for (const list of lists) {
    for (const entry of list) {
      const name = entry.country.trim();
      if (!name) continue;
      const key = countryKey(name);
      const existing = byKey.get(key);
      if (existing) {
        existing.teams = existing.teams.concat(entry.teams);
      } else {
        byKey.set(key, { country: name, teams: [...entry.teams] });
      }
    }
  }

  return [...byKey.values()]
    .map((c) => ({
      country: c.country,
      teams: dedupeTeams(c.teams).sort(
        (a, b) => b.year - a.year || a.name.localeCompare(b.name)
      ),
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
}
