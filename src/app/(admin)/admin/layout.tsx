import "@/app/admin-typography.css";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { getAdminInitials, getAdminRole } from "@/lib/admin-session";
import { APPLICATION_STATUS, PAYMENT_STATUS, TICKET_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/** Persistent admin chrome — sidebar stays mounted across navigations. */
export default async function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userInitials, role, pendingUsers, pendingPayments, openTickets] =
    await Promise.all([
      getAdminInitials(),
      getAdminRole(),
      prisma.user.count({
        where: {
          role: { not: "admin" },
          applicationStatus: APPLICATION_STATUS.PENDING,
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
    ]);

  const navCounts = {
    users: pendingUsers,
    payments: pendingPayments,
    tickets: openTickets,
  };

  return (
    <AdminLayout userInitials={userInitials} role={role} navCounts={navCounts}>
      {children}
    </AdminLayout>
  );
}
