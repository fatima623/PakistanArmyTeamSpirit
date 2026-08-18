/**
 * Shared types for the International Participation dashboard.
 *
 * Kept in their own module (no `server-only`, no Prisma) so both the server
 * aggregation lib (`international-participation.ts`) and the client dashboard
 * components can import them without pulling server code into the browser bundle.
 *
 * The dashboard mirrors the public website's International Participation map,
 * but year-wise: every International PATS edition (1st Intl 2016 → 9th Intl
 * 2026) with its roster of nations and each nation's teams.
 */

import type { Region } from "@/lib/country-region";

/** One participating nation within a single edition. */
export type ParticipatingCountry = {
  /** ISO-3166 alpha-2 (upper-case), or "" when the name doesn't resolve. */
  iso2: string;
  /** Display name. */
  name: string;
  region: Region;
  /** Number of teams (contingents + observers) fielded that year. */
  teamCount: number;
  /** Team labels exactly as shown on the website (e.g. "National contingent"). */
  teams: string[];
};

/** One International PATS edition and everyone who took part in it. */
export type EditionParticipation = {
  /** Ordinal on the participation slide — 1st Intl … 9th Intl. */
  edition: number;
  /** The edition year (e.g. 2026). */
  year: number;
  /** Month the edition was held, as printed on the slide. */
  month: string;
  /** Total teams across all nations that year. */
  totalTeams: number;
  /** Number of participating nations that year. */
  totalCountries: number;
  /**
   * True when the official team total exceeds the per-country sum — the slide
   * records "12 countries; 15 teams" for 2024/2025 without publishing the split.
   */
  teamsUnattributed: boolean;
  /** Every nation that took part that year, sorted by name. */
  countries: ParticipatingCountry[];
};

export type InternationalParticipation = {
  /** The current edition year (e.g. 2026). */
  year: number;
  /** Total teams across every nation in the current edition. */
  totalTeams: number;
  /** Number of nations in the current edition. */
  totalCountries: number;
  /** Every nation in the current edition, sorted by name. */
  countries: ParticipatingCountry[];
  /** Every edition on record, newest year first. */
  editions: EditionParticipation[];
};
