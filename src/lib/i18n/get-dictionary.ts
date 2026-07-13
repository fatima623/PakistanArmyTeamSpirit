import "server-only";

import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, localeDir, normalizeLocale, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/**
 * Reads the participant's chosen language from the locale cookie.
 * Server components only.
 */
export async function getLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export type PortalI18n = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
};

/**
 * Server-side translation accessor. Returns the active locale, its text
 * direction, and the full dictionary (`t`) for that locale.
 *
 *   const { t, dir } = await getDictionary();
 *   <h1>{t.nav.dashboard}</h1>
 */
export async function getDictionary(): Promise<PortalI18n> {
  const locale = await getLocale();
  return {
    locale,
    dir: localeDir(locale),
    t: dictionaries[locale],
  };
}
