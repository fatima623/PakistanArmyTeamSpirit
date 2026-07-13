/**
 * Country name → ISO-3166 alpha-2 resolution for the world map.
 *
 * `world.svg` identifies most countries by an `id="XX"` (ISO2) but a number are
 * identified only by `class`/`name` (China, United States, United Kingdom,
 * Malaysia, Turkey, "Russian Federation", …). Flags are named by ISO2
 * (`/flags/xx.png`), so those class-only countries — plus the app's own naming
 * variants ("Russia", "Ivory Coast", "Cabo Verde") — need an explicit map.
 * Countries that carry an `id` in the SVG resolve at runtime and need no entry.
 */

export type RegisteredTeam = { name: string; year: number };
export type RegisteredCountry = { country: string; teams: RegisteredTeam[] };

/** Accent-insensitive, punctuation-free key (e.g. "São Tomé" → "saotome"). */
export function normalizeCountryKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** normalizeCountryKey(name) → ISO2. Includes both app and SVG name variants. */
export const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  // PATS partner nations (from the international editions)
  pakistan: "PK",
  china: "CN",
  turkey: "TR",
  turkiye: "TR",
  jordan: "JO",
  malaysia: "MY",
  unitedkingdom: "GB",
  uk: "GB",
  greatbritain: "GB",
  srilanka: "LK",
  saudiarabia: "SA",
  southafrica: "ZA",
  uzbekistan: "UZ",
  kenya: "KE",
  morocco: "MA",
  nepal: "NP",
  iraq: "IQ",
  thailand: "TH",
  qatar: "QA",
  unitedstates: "US",
  unitedstatesofamerica: "US",
  usa: "US",
  kazakhstan: "KZ",
  bahrain: "BH",
  belarus: "BY",
  azerbaijan: "AZ",
  ghana: "GH",
  maldives: "MV",
  // Class-only SVG countries + common nations / aliases
  russia: "RU",
  russianfederation: "RU",
  india: "IN",
  indonesia: "ID",
  japan: "JP",
  germany: "DE",
  france: "FR",
  italy: "IT",
  spain: "ES",
  netherlands: "NL",
  belgium: "BE",
  canada: "CA",
  australia: "AU",
  newzealand: "NZ",
  egypt: "EG",
  iran: "IR",
  oman: "OM",
  kuwait: "KW",
  unitedarabemirates: "AE",
  uae: "AE",
  bangladesh: "BD",
  afghanistan: "AF",
  argentina: "AR",
  brazil: "BR",
  chile: "CL",
  denmark: "DK",
  norway: "NO",
  sweden: "SE",
  finland: "FI",
  greece: "GR",
  cyprus: "CY",
  malta: "MT",
  mauritius: "MU",
  seychelles: "SC",
  comoros: "KM",
  fiji: "FJ",
  samoa: "WS",
  tonga: "TO",
  vanuatu: "VU",
  solomonislands: "SB",
  papuanewguinea: "PG",
  philippines: "PH",
  angola: "AO",
  bahamas: "BS",
  antiguaandbarbuda: "AG",
  saintkittsandnevis: "KN",
  trinidadandtobago: "TT",
  caboverde: "CV",
  capeverde: "CV",
  saotomeandprincipe: "ST",
  micronesia: "FM",
  federatedstatesofmicronesia: "FM",
  ivorycoast: "CI",
  cotedivoire: "CI",
  northmacedonia: "MK",
  macedonia: "MK",
  vaticancity: "VA",
  holysee: "VA",
  southkorea: "KR",
  korea: "KR",
  northkorea: "KP",
  czechrepublic: "CZ",
  czechia: "CZ",
};

/** Resolve a country name to ISO2 via the static map (returns "" if unknown). */
export function countryNameToIso2(name: string): string {
  return COUNTRY_NAME_TO_ISO2[normalizeCountryKey(name)] ?? "";
}
