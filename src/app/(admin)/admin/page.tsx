import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

import { AdminChartsPlaceholder } from "@/components/admin/AdminChartsPlaceholder";
import { AdminDashboardStats } from "@/components/admin/AdminDashboardStats";
import { ApplicationStatusBadge } from "@/components/admin/StatusBadges";
import { APPLICATION_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import {
  getKpiSparklines,
  getRegistrationsByMonth,
  getStatusDistribution,
} from "@/lib/admin-dashboard-charts";
import { adminNavLabel } from "@/lib/admin-navigation";
import { PARTICIPANT_ROLE } from "@/lib/auth-routes";
import { prisma } from "@/lib/prisma";
import { IntlBadge } from "@/components/admin/IntlBadge";
import {
  displayCountry,
  isInternationalParticipant,
} from "@/lib/participant-country";
import { formatDateShort } from "@/lib/utils";

const AdminDashboardCharts = dynamic(
  () =>
    import("@/components/admin/AdminDashboardCharts").then(
      (m) => m.AdminDashboardCharts
    ),
  { loading: () => <AdminChartsPlaceholder /> }
);

export const metadata: Metadata = {
  title: adminNavLabel("dashboard"),
};

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    approvedUsers,
    pendingUsers,
    pendingPayments,
    recentRegistrations,
    registrationActivity,
    pipeline,
    kpiSparklines,
  ] = await Promise.all([
    prisma.user.count({ where: { role: PARTICIPANT_ROLE } }),
    prisma.user.count({
      where: {
        role: PARTICIPANT_ROLE,
        applicationStatus: APPLICATION_STATUS.APPROVED,
      },
    }),
    prisma.user.count({
      where: {
        role: PARTICIPANT_ROLE,
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
    prisma.user.findMany({
      where: { role: PARTICIPANT_ROLE },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        applicationStatus: true,
        createdAt: true,
        country: true,
        nationality: true,
        unit: { select: { unitName: true } },
      },
    }),
    getRegistrationsByMonth("6m"),
    getStatusDistribution(),
    getKpiSparklines(),
  ]);

  const stats = {
    total: totalUsers,
    approved: approvedUsers,
    pending: pendingUsers,
    payments: pendingPayments,
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-overview-head admin-fade-in-up admin-fade-in-up--delay-0">
     
        
          
      </div>

      <AdminDashboardStats stats={stats} series={kpiSparklines} />

      <AdminDashboardCharts
        initialRegistrationActivity={registrationActivity}
        initialPipeline={pipeline.data}
        initialPipelineTotal={pipeline.total}
      />

      <section
        aria-label="Recent registrations"
        className="admin-crm-card admin-crm-card--table admin-fade-in-up admin-fade-in-up--delay-5"
      >
        <div className="admin-crm-card-header">
          <h2 className="admin-crm-card-title">Recent Registrations</h2>
          <Link href="/admin/users" className="admin-crm-view-all">
            View all →
          </Link>
        </div>
        {recentRegistrations.length === 0 ? (
          <div className="admin-crm-empty">
            <p>No registrations yet</p>
          </div>
        ) : (
          <div className="admin-crm-table-wrap">
            <table className="admin-data-table admin-dashboard-recent-table w-full">
              <thead className="admin-table-head">
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Country</th>
                  <th scope="col">Registered</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((u) => (
                  <tr key={u.id} className="admin-row-hover">
                    <td className="font-semibold text-brand-ink">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="text-sm text-brand-ink-muted">
                      {u.unit?.unitName ?? "—"}
                    </td>
                    <td className="text-sm text-brand-ink-muted">
                      {displayCountry(u.country)}
                      {isInternationalParticipant(u.country) ? (
                        <IntlBadge />
                      ) : null}
                    </td>
                    <td className="text-sm text-brand-ink-muted">
                      {formatDateShort(u.createdAt)}
                    </td>
                    <td>
                      <ApplicationStatusBadge
                        status={u.applicationStatus}
                        density="table"
                        showPrefix={false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
