
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getAdminInitials, getAdminRole } from "@/lib/admin-session";
import { APPLICATION_STATUS, PAYMENT_STATUS, TICKET_STATUS } from "@/lib/constants";
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
    pendingPayments,
    openTickets,
    pendingTeamRequests,
    awaitingFinalize,
  ] = await Promise.all([
    getAdminInitials(),
    getAdminRole(),
    prisma.user.count({
      where: {
        role: PARTICIPANT_ROLE,
        applicationStatus: {
          in: [APPLICATION_STATUS.PENDING, APPLICATION_STATUS.UNDER_REVIEW],
        },
      },
    }),
    prisma.payment.count({
      where: {
        status: {
          in: [PAYMENT_STATUS.SUBMITTED, PAYMENT_STATUS.UNDER_REVIEW],
        },
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
    payments: pendingPayments,
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
