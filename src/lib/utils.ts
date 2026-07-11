import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const utcDateFormat = {
  timeZone: "UTC",
} as const;

/** UTC-based formatting so SSR and client hydration produce identical strings. */
export function formatDateLong(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    ...utcDateFormat,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    ...utcDateFormat,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateDisplay(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    ...utcDateFormat,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** e.g. 28 May 2026, 3:42 PM — UTC for SSR/client consistency */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
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
export function formatDateTimePK(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}
