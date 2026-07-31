/**
 * Shared types for the International Participation dashboard.
 *
 * Kept in their own module (no `server-only`, no Prisma) so both the server
 * aggregation lib (`international-participation.ts`) and the client dashboard
 * components can import them without pulling server code into the browser bundle.
 */

import type { Region } from "@/lib/country-region";

/** One country's participation across every year we have data for. */
export type CountryParticipation = {
  /** ISO-3166 alpha-2 (upper-case), or "" when the name doesn't resolve. */
  iso2: string;
  /** Display name. */
  name: string;
  region: Region;
  /** Team count keyed by year (only years with ≥1 team are present). */
  byYear: Record<number, number>;
  /** Years the country participated, ascending. */
  years: number[];
  /** Earliest participation year. */
  firstYear: number;
  /** Total teams summed across all years. */
  totalTeams: number;
  /** Distinct years participated. */
  totalParticipations: number;
};

export type InternationalParticipation = {
  /** All years with data, descending (newest first). */
  years: number[];
  /** Every participating country, sorted by name. */
  countries: CountryParticipation[];
};
