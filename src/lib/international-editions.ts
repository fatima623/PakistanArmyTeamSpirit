/**
 * PATS International participation history — one record per edition.
 *
 * Sources (both official):
 *   - The "PREV PARTICIPATION" slide: 1st Intl (Mar 2016) → 8th Intl (Apr 2025).
 *   - The "Intl Teams" slide for the 9th Intl (2026) roster.
 *
 * This module is the single source of truth for *who took part in which year*.
 * Everything downstream derives from it:
 *   - `international-participants.ts` turns editions into `RegisteredCountry[]`
 *     for the public map (`/api/public/registered-countries`), and
 *   - `international-participation.ts` groups them per year for the admin
 *     dashboard.
 *
 * Deliberately free of `server-only`, Prisma and React so both the server
 * aggregation and the client dashboard can import it.
 *
 * Every `country` here must normalise to an entry in `COUNTRY_NAME_TO_ISO2`
 * (`country-iso.ts`) so it resolves to a flag and a `world.svg` shape.
 */

/** One nation's participation in a single edition. */
export type EditionCountry = {
  /** Display name (English), e.g. "Saudi Arabia". */
  country: string;
  /** Competing contingents fielded that year. */
  contingents: number;
  /** True when the nation also sent (or only sent) an observer delegation. */
  observer?: boolean;
};

/** One International PATS edition. */
export type PatsEdition = {
  /** Ordinal on the slide — 1st Intl … 9th Intl. */
  edition: number;
  year: number;
  /** Month the edition was held, as printed on the slide. */
  month: string;
  countries: EditionCountry[];
  /**
   * Team total printed on the slide when it is higher than the per-country sum
   * (the 7th and 8th editions record "12 countries; 15 teams" without
   * publishing which nations fielded the extra teams). Left unset otherwise.
   */
  officialTeams?: number;
};

/** `n` competing contingents, no observers. */
function ct(country: string, contingents = 1): EditionCountry {
  return { country, contingents };
}

/** `n` competing contingents plus an observer delegation. */
function ctObs(country: string, contingents = 1): EditionCountry {
  return { country, contingents, observer: true };
}

/** Observer delegation only — no competing contingent. */
function obs(country: string): EditionCountry {
  return { country, contingents: 0, observer: true };
}

/**
 * Every International PATS edition, oldest first.
 *
 * Historic editions (2016–2025) record one national contingent per nation:
 * the slide lists the flags, not the per-nation team split.
 */
export const PATS_EDITIONS: PatsEdition[] = [
  {
    edition: 1,
    year: 2016,
    month: "Mar",
    countries: [ct("Sri Lanka")],
  },
  {
    edition: 2,
    year: 2017,
    month: "Mar",
    countries: [
      ct("Sri Lanka"),
      ct("Turkiye"),
      ct("Jordan"),
      ct("China"),
      ct("United Kingdom"),
      ct("Malaysia"),
    ],
  },
  {
    edition: 3,
    year: 2020,
    month: "Mar",
    countries: [
      ct("Sri Lanka"),
      ct("Turkiye"),
      ct("South Africa"),
      ct("Saudi Arabia"),
    ],
  },
  {
    edition: 4,
    year: 2021,
    month: "Mar",
    countries: [
      ct("Sri Lanka"),
      ct("Turkiye"),
      ct("Jordan"),
      ct("Uzbekistan"),
    ],
  },
  {
    edition: 5,
    year: 2022,
    month: "Mar",
    countries: [
      ct("Sri Lanka"),
      ct("Turkiye"),
      ct("Jordan"),
      ct("Saudi Arabia"),
      ct("Uzbekistan"),
      ct("Morocco"),
      ct("Nepal"),
      ct("Kenya"),
    ],
  },
  {
    edition: 6,
    year: 2023,
    month: "Mar",
    countries: [
      ct("Iraq"),
      ct("Thailand"),
      ct("Jordan"),
      ct("Saudi Arabia"),
      ct("Uzbekistan"),
      ct("Morocco"),
      ct("United States"),
      ct("Kazakhstan"),
      ct("Bahrain"),
      ct("Qatar"),
    ],
  },
  {
    edition: 7,
    year: 2024,
    month: "Feb",
    officialTeams: 15,
    countries: [
      ct("Sri Lanka"),
      ct("Turkiye"),
      ct("Jordan"),
      ct("Saudi Arabia"),
      ct("Uzbekistan"),
      ct("Morocco"),
      ct("Maldives"),
      ct("Kazakhstan"),
      ct("Bahrain"),
      ct("Qatar"),
      ct("Thailand"),
      ct("United States"),
    ],
  },
  {
    edition: 8,
    year: 2025,
    month: "Apr",
    officialTeams: 15,
    countries: [
      ct("Sri Lanka"),
      ct("Turkiye"),
      ct("Nepal"),
      ct("Saudi Arabia"),
      ct("Uzbekistan"),
      ct("Morocco"),
      ct("Maldives"),
      ct("China"),
      ct("Bahrain"),
      ct("Qatar"),
      ct("Belarus"),
      ct("United States"),
    ],
  },
  {
    // 9th Intl — the current edition. Contingent/observer counts come from the
    // "Intl Teams" roster slide (KSA fields 5 teams, Qatar 3, the UAE 4).
    edition: 9,
    year: 2026,
    month: "Feb",
    countries: [
      ctObs("Bahrain"),
      ctObs("Bangladesh"),
      ct("Belarus"),
      ctObs("Egypt"),
      ct("Iraq"),
      ct("Jordan"),
      ct("Saudi Arabia", 5),
      ctObs("United Arab Emirates", 4),
      ctObs("Maldives"),
      ctObs("Malaysia"),
      ct("Morocco"),
      ct("Nepal"),
      ct("Qatar", 3),
      ct("Sri Lanka"),
      ctObs("Turkiye"),
      ct("United States"),
      ct("Uzbekistan"),
      obs("Indonesia"),
      obs("Myanmar"),
      obs("Thailand"),
    ],
  },
];

/** The edition currently being staged (the highest year on record). */
export const CURRENT_EDITION: PatsEdition =
  PATS_EDITIONS[PATS_EDITIONS.length - 1]!;

/** Edition year for the current (9th PATS) contingents. */
export const CURRENT_EDITION_YEAR = CURRENT_EDITION.year;

/** Every edition year, newest first — the order the year filters use. */
export const EDITION_YEARS_DESC: number[] = PATS_EDITIONS.map((e) => e.year)
  .slice()
  .sort((a, b) => b - a);

/** Teams fielded in one edition — the official figure when the slide gives one. */
export function editionTeamCount(edition: PatsEdition): number {
  const sum = edition.countries.reduce(
    (n, c) => n + c.contingents + (c.observer ? 1 : 0),
    0
  );
  return Math.max(sum, edition.officialTeams ?? 0);
}
