
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getAdminInitials, getAdminRole } from "@/lib/admin-session";
import { TICKET_STATUS } from "@/lib/constants";
import { pendingApplicationStatusFilter } from "@/lib/user-status";
import { PARTICIPANT_ROLE } from "@/lib/auth-routes";
import { prisma } from "@/lib/prisma";

/** Persistent admin chrome — sidebar stays mounted across navigations. */
export default async function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    userInitials,
    role,
    pendingUsers,
    openTickets,
    pendingTeamRequests,
    awaitingFinalize,
  ] = await Promise.all([
    getAdminInitials(),
    getAdminRole(),
    prisma.user.count({
      where: {
        role: PARTICIPANT_ROLE,
        /* Same bucket the Pending chip counts and lists, so the sidebar badge
           cannot drift from the queue it points at. */
        applicationStatus: pendingApplicationStatusFilter(),
      },
    }),
    prisma.supportTicket.count({
      where: {
        status: { in: [TICKET_STATUS.OPEN, TICKET_STATUS.IN_PROGRESS] },
      },
    }),
    prisma.teamSizeRequest.count({ where: { status: "PENDING" } }),
    // "Awaiting finalize" must mean exactly what the finalize gate means:
    // roster complete, not yet finalized, and EVERY traveller has a record with
    // both documents on file. Prisma has no `every` on a to-many filter, so it
    // is expressed as "no member is incomplete" (an empty roster is excluded by
    // requiring at least one member).
    prisma.user.count({
      where: {
        role: PARTICIPANT_ROLE,
        rosterCompletedAt: { not: null },
        flightsFinalizedAt: null,
        teamMembers: { some: {} },
        NOT: {
          teamMembers: {
            some: {
              OR: [
                { flightDetail: null },
                { flightDetail: { passportFilePath: null } },
                { flightDetail: { ticketFilePath: null } },
              ],
            },
          },
        },
      },
    }),
  ]);

  const navCounts = {
    users: pendingUsers,
    tickets: openTickets,
    teamRequests: pendingTeamRequests,
    flights: awaitingFinalize,
  };

  return (
    <AdminLayout userInitials={userInitials} role={role} navCounts={navCounts}>
      {children}
    </AdminLayout>
  );
}
