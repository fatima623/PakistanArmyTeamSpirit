/**
 * Shared types for the International Participation dashboard.
 *
 * Kept in their own module (no `server-only`, no Prisma) so both the server
 * aggregation lib (`international-participation.ts`) and the client dashboard
 * components can import them without pulling server code into the browser bundle.
 *
 * The dashboard mirrors the public website's International Participation map:
 * the current-edition roster of nations and each nation's teams. It is a single
 * edition (year) — no historical multi-year data.
 */

import type { Region } from "@/lib/country-region";

/** One participating nation in the current edition. */
export type ParticipatingCountry = {
  /** ISO-3166 alpha-2 (upper-case), or "" when the name doesn't resolve. */
  iso2: string;
  /** Display name. */
  name: string;
  region: Region;
  /** Number of teams (contingents + observers) fielded. */
  teamCount: number;
  /** Team labels exactly as shown on the website (e.g. "National contingent"). */
  teams: string[];
};

export type InternationalParticipation = {
  /** The edition year (e.g. 2026). */
  year: number;
  /** Total teams across all nations. */
  totalTeams: number;
  /** Number of participating nations. */
  totalCountries: number;
  /** Every participating nation, sorted by name. */
  countries: ParticipatingCountry[];
};
