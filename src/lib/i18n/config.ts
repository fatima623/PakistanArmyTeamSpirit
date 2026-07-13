// Central locale configuration for the participant portal.
// English is the source language; Russian, Turkish, Arabic and Chinese are
// supported. Arabic is right-to-left.

export const LOCALES = ["en", "ru", "tr", "ar", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// Locales that render right-to-left.
export const RTL_LOCALES: Locale[] = ["ar"];

// Cookie the portal uses to remember the participant's language choice.
export const LOCALE_COOKIE = "pp_locale";

// Native display names shown in the language switcher.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  tr: "Türkçe",
  ar: "العربية",
  zh: "中文",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}
