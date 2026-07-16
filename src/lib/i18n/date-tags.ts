/**
 * BCP-47 tags used for `Intl.DateTimeFormat` per portal locale.
 *
 * The portal's `Locale` values are bare language codes; `Intl` wants a region
 * for sensible date ordering, so this map pins one per locale. It was
 * previously duplicated inline in TeamRosterManager and FlightDetailsManager —
 * both now import from here.
 */

import type { Locale } from "@/lib/i18n/config";

export const DATE_TAG: Record<Locale, string> = {
  en: "en-GB",
  ru: "ru-RU",
  tr: "tr-TR",
  ar: "ar-EG",
  zh: "zh-CN",
};

/** `en-GB` for unknown/absent locales — keeps non-portal callers unchanged. */
export function dateTag(locale?: Locale): string {
  return (locale && DATE_TAG[locale]) || DATE_TAG.en;
}
