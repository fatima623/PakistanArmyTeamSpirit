import {
  COUNTRY_NAMES,
  INTERNATIONAL_EDITIONS,
  type CountryCode,
} from "@/lib/pats-content";

export type ContingentRecord = {
  code: CountryCode;
  teamIndex: number;
  designation: string;
  label: string;
  editions: number[];
  appearances: number;
  lastEdition: number;
  /** Display metric for drawer — derived from participation depth */
  readinessIndex: number;
};

const FORCE_DESIGNATIONS: Partial<Record<CountryCode, string>> = {
  JO: "ROYAL JORDANIAN LAND FORCES",
  SA: "ROYAL SAUDI LAND FORCES",
  TR: "TURKISH LAND FORCES",
  GB: "BRITISH ARMY",
  US: "UNITED STATES ARMY",
  CN: "PEOPLE'S LIBERATION ARMY",
  PK: "PAKISTAN ARMY",
  MY: "MALAYSIAN ARMED FORCES",
  LK: "SRI LANKA ARMY",
  QA: "QATAR ARMED FORCES",
  BH: "BAHRAIN DEFENCE FORCE",
  MA: "ROYAL MOROCCAN ARMED FORCES",
  KE: "KENYA DEFENCE FORCES",
  ZA: "SOUTH AFRICAN NATIONAL DEFENCE FORCE",
  UZ: "UZBEKISTAN ARMED FORCES",
  IQ: "IRAQI GROUND FORCES",
  TH: "ROYAL THAI ARMY",
  KZ: "KAZAKHSTAN ARMED FORCES",
  NP: "NEPAL ARMY",
  BY: "BELARUSIAN GROUND FORCES",
};

function forceName(code: CountryCode): string {
  return (
    FORCE_DESIGNATIONS[code] ??
    `${COUNTRY_NAMES[code].toUpperCase()} ARMED FORCES`
  );
}

/** Contingents matrix derived from international edition history. */
export function buildContingents(): ContingentRecord[] {
  const map = new Map<CountryCode, number[]>();
  INTERNATIONAL_EDITIONS.forEach((e) => {
    e.countries.forEach((c) => {
      const years = map.get(c) ?? [];
      years.push(e.year);
      map.set(c, years);
    });
  });

  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([code, editions], i) => {
      const sorted = [...editions].sort((a, b) => b - a);
      const teamIndex = (i % 12) + 1;
      const designation = forceName(code);
      return {
        code,
        teamIndex,
        designation,
        label: `TEAM ${String(teamIndex).padStart(2, "0")} — ${designation}`,
        editions: sorted,
        appearances: sorted.length,
        lastEdition: sorted[0] ?? 0,
        readinessIndex: Math.min(99, 62 + sorted.length * 6 + (sorted[0] >= 2024 ? 8 : 0)),
      };
    });
}

export const CONTINGENTS = buildContingents();
