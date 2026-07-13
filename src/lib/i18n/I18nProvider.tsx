"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { localeDir, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

type I18nValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Makes the active dictionary available to client components inside the
 * participant portal. Only the `locale` string crosses the server/client
 * boundary — the dictionary (which contains formatter functions that cannot
 * be serialized) is resolved on the client from the bundled dictionaries.
 */
export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value: I18nValue = useMemo(
    () => ({ locale, dir: localeDir(locale), t: dictionaries[locale] }),
    [locale]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Client-component translation hook.
 *
 *   const { t, dir } = useI18n();
 *   <span>{t.nav.logout}</span>
 */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
