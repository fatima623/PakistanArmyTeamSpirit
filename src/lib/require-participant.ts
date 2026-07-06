import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/cached-auth";
import { canAccessAdminArea, getRoleHomePath } from "@/lib/auth-routes";

/** Ensures a logged-in participant session; staff (admin/MTD/SDBS) go to /admin. */
export async function requireParticipantSession() {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/event/login");
  }
  if (canAccessAdminArea(session.user.role)) {
    redirect(getRoleHomePath(session.user.role));
  }
  return session;
}
