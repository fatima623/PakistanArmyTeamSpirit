import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { dateTag } from "@/lib/i18n/date-tags"
import type { Locale } from "@/lib/i18n/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const utcDateFormat = {
  timeZone: "UTC",
} as const;

/* Every formatter takes an OPTIONAL trailing `locale`. Omitting it keeps the
 * historical en-GB output, so admin and other non-localized callers are
 * unaffected; portal callers thread the active locale through. The fixed
 * time zone is deliberate — it keeps SSR and hydration byte-identical. */

/** UTC-based formatting so SSR and client hydration produce identical strings. */
export function formatDateLong(date: Date | string, locale?: Locale): string {
  return new Intl.DateTimeFormat(dateTag(locale), {
    ...utcDateFormat,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string, locale?: Locale): string {
  return new Intl.DateTimeFormat(dateTag(locale), {
    ...utcDateFormat,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateDisplay(date: Date | string, locale?: Locale): string {
  return new Intl.DateTimeFormat(dateTag(locale), {
    ...utcDateFormat,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** e.g. 28 May 2026, 3:42 PM — UTC for SSR/client consistency */
export function formatDateTime(date: Date | string, locale?: Locale): string {
  return new Intl.DateTimeFormat(dateTag(locale), {
    ...utcDateFormat,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

/** e.g. 10 Jul 2026, 6:42 PM in Pakistan Standard Time — used for admin
 *  activity timelines so events show local wall-clock time. Fixed zone keeps
 *  SSR and client hydration output identical. */
export function formatDateTimePK(date: Date | string, locale?: Locale): string {
  return new Intl.DateTimeFormat(dateTag(locale), {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}
