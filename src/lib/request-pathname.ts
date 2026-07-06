import "server-only";

import { headers } from "next/headers";

/** Pathname set by middleware for SSR nav active states (no client hook). */
export async function getRequestPathname(): Promise<string> {
  const h = await headers();
  return h.get("x-pathname") ?? "/";
}
