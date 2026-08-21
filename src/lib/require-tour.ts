import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/cached-auth";

/**
 * Tour pages (the former public marketing site) require a login. Any role may
 * look around — participants reach it from the portal sidebar, staff from the
 * admin console — so this only asserts that somebody is signed in.
 *
 * The middleware already redirects anonymous visitors; this is the per-page
 * backstop for routes its matcher does not cover.
 */
export async function requireTourAccess() {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/event/login");
  }
  return session;
}
