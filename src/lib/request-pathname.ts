import "server-only";

import { headers } from "next/headers";

/** Pathname set by middleware for SSR nav active states (no client hook). */
export async function getRequestPathname(): Promise<string> {
  return (await getRequestPathnameOrNull()) ?? "/";
}

/**
 * The raw header, or null when the middleware did not run for this request —
 * its matcher does not cover every public route (see src/middleware.ts).
 *
 * Callers that must tell "this IS the home page" apart from "we don't know"
 * need this rather than `getRequestPathname`, whose "/" fallback conflates the
 * two. "/" is itself in the matcher, so a missing header always means some
 * other route.
 */
export async function getRequestPathnameOrNull(): Promise<string | null> {
  const h = await headers();
  return h.get("x-pathname");
}
