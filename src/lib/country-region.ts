/**
 * Country → world region resolution for the International Participation
 * dashboard's "All Regions" filter.
 *
 * Regions are keyed by ISO-3166 alpha-2 (resolved through `country-iso.ts`, which
 * already owns the name → ISO2 table) so naming variants all land on the same
 * bucket. Anything unresolved falls back to `"Other"` so a DB-added country never
 * breaks the filter — it just groups under Other.
 */

import { countryNameToIso2 } from "@/lib/country-iso";

export const REGIONS = [
  "Asia",
  "Middle East",
  "Africa",
  "Europe",
  "Americas",
  "Oceania",
  "Other",
] as const;

export type Region = (typeof REGIONS)[number];

/** ISO2 → region. Covers every code in `COUNTRY_NAME_TO_ISO2`. */
const REGION_BY_ISO2: Record<string, Region> = {
  // --- Middle East ---
  SA: "Middle East", JO: "Middle East", IQ: "Middle East", QA: "Middle East",
  BH: "Middle East", AE: "Middle East", OM: "Middle East", KW: "Middle East",
  YE: "Middle East", IL: "Middle East", LB: "Middle East", SY: "Middle East",
  PS: "Middle East", TR: "Middle East",

  // --- Asia (South / Central / East / South-East / Caucasus) ---
  PK: "Asia", CN: "Asia", MY: "Asia", LK: "Asia", UZ: "Asia", NP: "Asia",
  TH: "Asia", KZ: "Asia", IN: "Asia", ID: "Asia", JP: "Asia", KR: "Asia",
  KP: "Asia", BD: "Asia", AF: "Asia", PH: "Asia", MM: "Asia", BN: "Asia",
  BT: "Asia", KH: "Asia", LA: "Asia", MN: "Asia", MV: "Asia", SG: "Asia",
  TW: "Asia", TJ: "Asia", TM: "Asia", KG: "Asia", VN: "Asia", TL: "Asia",
  AZ: "Asia", AM: "Asia", GE: "Asia",

  // --- Africa ---
  ZA: "Africa", KE: "Africa", MA: "Africa", GH: "Africa", EG: "Africa",
  DZ: "Africa", AO: "Africa", BJ: "Africa", BW: "Africa", BF: "Africa",
  BI: "Africa", CM: "Africa", CF: "Africa", TD: "Africa", KM: "Africa",
  CG: "Africa", CD: "Africa", CI: "Africa", DJ: "Africa", GQ: "Africa",
  ER: "Africa", SZ: "Africa", ET: "Africa", GA: "Africa", GM: "Africa",
  GN: "Africa", GW: "Africa", LS: "Africa", LR: "Africa", LY: "Africa",
  MG: "Africa", MW: "Africa", ML: "Africa", MR: "Africa", MU: "Africa",
  MZ: "Africa", NA: "Africa", NE: "Africa", NG: "Africa", RW: "Africa",
  ST: "Africa", SN: "Africa", SC: "Africa", SL: "Africa", SO: "Africa",
  SS: "Africa", SD: "Africa", TZ: "Africa", TG: "Africa", TN: "Africa",
  UG: "Africa", ZM: "Africa", ZW: "Africa", CV: "Africa",

  // --- Europe ---
  GB: "Europe", RU: "Europe", DE: "Europe", FR: "Europe", IT: "Europe",
  ES: "Europe", NL: "Europe", BE: "Europe", DK: "Europe", NO: "Europe",
  SE: "Europe", FI: "Europe", GR: "Europe", CY: "Europe", MT: "Europe",
  MK: "Europe", VA: "Europe", CZ: "Europe", AL: "Europe", AD: "Europe",
  AT: "Europe", BA: "Europe", BG: "Europe", HR: "Europe", EE: "Europe",
  HU: "Europe", IS: "Europe", IE: "Europe", LV: "Europe", LI: "Europe",
  LT: "Europe", LU: "Europe", MD: "Europe", MC: "Europe", ME: "Europe",
  PL: "Europe", PT: "Europe", RO: "Europe", SM: "Europe", RS: "Europe",
  SK: "Europe", SI: "Europe", CH: "Europe", UA: "Europe", BY: "Europe",

  // --- Americas ---
  US: "Americas", CA: "Americas", AR: "Americas", BR: "Americas", CL: "Americas",
  CO: "Americas", CR: "Americas", CU: "Americas", DM: "Americas", DO: "Americas",
  EC: "Americas", SV: "Americas", GT: "Americas", GY: "Americas", HT: "Americas",
  HN: "Americas", JM: "Americas", MX: "Americas", NI: "Americas", PA: "Americas",
  PY: "Americas", PE: "Americas", SR: "Americas", TT: "Americas", UY: "Americas",
  VE: "Americas", BS: "Americas", AG: "Americas", BB: "Americas", BZ: "Americas",
  GD: "Americas", KN: "Americas", LC: "Americas", VC: "Americas",

  // --- Oceania ---
  AU: "Oceania", NZ: "Oceania", FJ: "Oceania", WS: "Oceania", TO: "Oceania",
  VU: "Oceania", SB: "Oceania", PG: "Oceania", FM: "Oceania", KI: "Oceania",
  MH: "Oceania", NR: "Oceania", PW: "Oceania", TV: "Oceania",
};

/** Region for an ISO2 code (upper-case), or "Other" when unmapped. */
export function regionForIso2(iso2: string): Region {
  return REGION_BY_ISO2[iso2.toUpperCase()] ?? "Other";
}

/** Region for a country display name, resolved via the ISO2 table. */
export function regionForCountry(name: string): Region {
  const iso2 = countryNameToIso2(name);
  return iso2 ? regionForIso2(iso2) : "Other";
}
