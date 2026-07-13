"use server";

import { cookies } from "next/headers";

import { LOCALE_COOKIE, normalizeLocale } from "./config";

/**
 * Persists the participant's language choice in a cookie. The portal server
 * components read this cookie on the next render (triggered by router.refresh
 * on the client), so the whole panel re-renders in the selected language.
 */
export async function setLocale(value: string): Promise<void> {
  const locale = normalizeLocale(value);
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // one year
    sameSite: "lax",
  });
}
