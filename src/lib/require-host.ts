import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/cached-auth";
import { canAccessHostArea, getRoleHomePath } from "@/lib/auth-routes";

/**
 * Ensures a logged-in Host Formation session. Anyone else (participants, staff)
 * is redirected to their own home. Mirrors requireParticipantSession.
 */
export async function requireHostSession() {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/event/login");
  }
  if (!canAccessHostArea(session.user.role)) {
    redirect(getRoleHomePath(session.user.role));
  }
  return session;
}
