/**
 * Predefined PATS participating nations shown on the International Participation
 * map by default. These are the confirmed 9th PATS contingents and observers.
 *
 * The map merges this static set with the live, DB-derived list from
 * `/api/public/registered-countries`, so:
 *   - the map always initialises with these nations (even before anyone
 *     registers, and even if the database is unavailable), and
 *   - any country added later through the admin panel / database appears
 *     automatically — no code change required.
 *
 * Every `country` name here must normalise to an entry in
 * `COUNTRY_NAME_TO_ISO2` so it resolves to a flag and a `world.svg` shape.
 */

import {
  countryNameToIso2,
  normalizeCountryKey,
  type RegisteredCountry,
  type RegisteredTeam,
} from "@/lib/country-iso";

/** Edition year for the predefined (9th PATS) contingents. */
const EDITION_YEAR = 2026;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** `n` competing contingents for a nation, numbered when more than one. */
function contingents(n = 1): RegisteredTeam[] {
  if (n <= 1) return [{ name: "National contingent", year: EDITION_YEAR }];
  return Array.from({ length: n }, (_, i) => ({
    name: `National contingent ${ROMAN[i] ?? i + 1}`,
    year: EDITION_YEAR,
  }));
}

const OBSERVER: RegisteredTeam = {
  name: "Observer delegation",
  year: EDITION_YEAR,
};

/**
 * 9th PATS roster (see the official participation slide):
 *   - Pakistan hosts.
 *   - 15 friendly nations field competing contingents (Saudi Arabia sends 4).
 *   - Several nations also — or only — attend as observers.
 */
export const PREDEFINED_PARTICIPANTS: RegisteredCountry[] = [
  { country: "Pakistan", teams: [{ name: "Host contingent", year: EDITION_YEAR }] },
  { country: "Bahrain", teams: [...contingents(), OBSERVER] },
  { country: "Belarus", teams: contingents() },
  { country: "Bangladesh", teams: [...contingents(), OBSERVER] },
  { country: "Egypt", teams: [...contingents(), OBSERVER] },
  { country: "Jordan", teams: contingents() },
  { country: "Saudi Arabia", teams: [...contingents(4), OBSERVER] },
  { country: "Maldives", teams: [...contingents(), OBSERVER] },
  { country: "Malaysia", teams: [...contingents(), OBSERVER] },
  { country: "Morocco", teams: contingents() },
  { country: "Nepal", teams: contingents() },
  { country: "Qatar", teams: contingents() },
  { country: "Sri Lanka", teams: contingents() },
  { country: "Turkey", teams: [...contingents(), OBSERVER] },
  { country: "United States", teams: contingents() },
  { country: "Uzbekistan", teams: contingents() },
  { country: "Indonesia", teams: [OBSERVER] },
  { country: "Myanmar", teams: [OBSERVER] },
  { country: "Thailand", teams: [OBSERVER] },
];

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
 * a single entry whose teams are the union of all sources — so a predefined
 * nation that also has real registered teams shows both, with no duplicate
 * country marker. The first list's display name wins for a given key.
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
