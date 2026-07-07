import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/cached-auth";
import { canAccessAdminArea, getRoleHomePath } from "@/lib/auth-routes";
import { prisma } from "@/lib/prisma";

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

/**
 * Participant session that has confirmed participation. Participants who have
 * not yet confirmed (or whose deadline handling is pending) are routed to the
 * confirmation dialog before they may use the portal.
 */
export async function requireConfirmedParticipant() {
  const session = await requireParticipantSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { participationConfirmedAt: true },
  });
  if (!user) {
    redirect("/event/login");
  }
  if (!user.participationConfirmedAt) {
    redirect("/event/confirm-participation");
  }
  return session;
}
