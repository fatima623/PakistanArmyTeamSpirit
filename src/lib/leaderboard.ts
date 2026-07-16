/** Illustrative standings for awards UX — replace with live scoring API when available. */

export type LeaderboardEntry = {
  rank: number;
  team: string;
  nation: string;
  score: number;
};

export const STANDINGS_PREVIEW: LeaderboardEntry[] = [
  { rank: 1, team: "TEAM 07", nation: "Jordan", score: 78.4 },
  { rank: 2, team: "TEAM 03", nation: "Saudi Arabia", score: 76.1 },
  { rank: 3, team: "TEAM 11", nation: "Turkey", score: 74.8 },
  { rank: 4, team: "TEAM 02", nation: "Pakistan", score: 72.3 },
  { rank: 5, team: "TEAM 09", nation: "United States", score: 69.5 },
  { rank: 6, team: "TEAM 04", nation: "Morocco", score: 67.2 },
  { rank: 7, team: "TEAM 06", nation: "Uzbekistan", score: 64.9 },
  { rank: 8, team: "TEAM 01", nation: "Sri Lanka", score: 61.0 },
];

export type MedalTierId = "gold" | "silver" | "bronze" | "certificate";

export type MedalTier = {
  id: MedalTierId;
  /** Medal category name shown in the first column. */
  label: string;
  /** Inclusive lower bound. `null` = participation floor (no minimum). */
  minPercent: number | null;
  /** Human-readable band, e.g. "65% – 74.99%". */
  band: string;
};

/**
 * Medal bands, highest first. `minPercent` is the single source of truth for
 * which tier a score lands in; `band` is display copy derived from the same
 * numbers. The awards hero meta and the medal cards quote these same bounds.
 */
export const MEDAL_TIERS: readonly MedalTier[] = [
  { id: "gold", label: "Gold", minPercent: 75, band: "75% and above" },
  { id: "silver", label: "Silver", minPercent: 65, band: "65% – 74.99%" },
  { id: "bronze", label: "Bronze", minPercent: 55, band: "55% – 64.99%" },
  {
    id: "certificate",
    label: "Certificate",
    minPercent: null,
    band: "Below 55%",
  },
];

export type QualifiedCountry = {
  nation: string;
  team: string;
  score: number;
};

export type MedalTierStanding = MedalTier & {
  /** Countries whose score falls in this band, best first. */
  countries: QualifiedCountry[];
};

/** The tier a given overall percentage qualifies for. */
export function tierForScore(score: number): MedalTierId {
  for (const tier of MEDAL_TIERS) {
    if (tier.minPercent != null && score >= tier.minPercent) return tier.id;
  }
  return "certificate";
}

/**
 * Bucket the standings into medal tiers so the awards table can list which
 * countries currently qualify for each category.
 */
export function getMedalTierStandings(
  entries: readonly LeaderboardEntry[] = STANDINGS_PREVIEW
): MedalTierStanding[] {
  return MEDAL_TIERS.map((tier) => ({
    ...tier,
    countries: entries
      .filter((e) => tierForScore(e.score) === tier.id)
      .sort((a, b) => b.score - a.score)
      .map(({ nation, team, score }) => ({ nation, team, score })),
  }));
}
