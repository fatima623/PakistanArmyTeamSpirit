/**
 * Display localization for the fixed unit enum vocabularies (unit type, branch,
 * arm). The value stored / submitted to the API stays the canonical English
 * token — only the label a participant SEES is translated, via `t.unit.options`.
 *
 * Anything unrecognised (unit names, free text) falls back to the raw string, so
 * the same helper is safe to call on mixed content.
 */

import type { Dictionary } from "@/lib/i18n/dictionaries";

type UnitOptions = Dictionary["unit"]["options"];

/** Stored English enum value → key in the `unit.options` dictionary slice. */
const OPTION_KEYS: Record<string, keyof UnitOptions> = {
  Regular: "regular",
  Reserve: "reserve",
  Army: "army",
  Navy: "navy",
  "Air Force": "airForce",
  Combat: "combat",
  "Combat Support": "combatSupport",
  "Combat Service Support": "combatServiceSupport",
};

/**
 * Map a stored English unit enum value to its localized label. Unmapped values
 * (e.g. custom unit names, free text) return unchanged.
 */
export function translateUnitOption(value: string, options: UnitOptions): string {
  const key = OPTION_KEYS[value];
  return key ? options[key] : value;
}
