import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/cached-auth";
import { canAccessAdminArea, getRoleHomePath } from "@/lib/auth-routes";

export async function getAdminInitials() {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/event/login");
  }
  if (!canAccessAdminArea(session.user.role)) {
    redirect(getRoleHomePath(session.user.role));
  }

  const first = session.user.firstName?.[0] ?? "";
  const last = session.user.lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "AD";
}

/** Current staff member's role for nav/permission gating in the admin console. */
export async function getAdminRole(): Promise<string> {
  const session = await getCachedSession();
  return session?.user?.role ?? "user";
}
