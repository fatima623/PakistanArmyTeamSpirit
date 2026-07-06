import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LifeBuoy,
  RotateCcw,
  Shield,
  Users,
} from "lucide-react";

import { AdminChartsPlaceholder } from "@/components/admin/AdminChartsPlaceholder";
import { AdminDashboardStats } from "@/components/admin/AdminDashboardStats";
import { ApplicationStatusBadge } from "@/components/admin/StatusBadges";
import {
  APPLICATION_STATUS,
  PAYMENT_STATUS,
  TICKET_STATUS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { adminSurface } from "@/lib/admin-ui";
import {
  getKpiSparklines,
  getRegistrationsByMonth,
  getStatusDistribution,
} from "@/lib/admin-dashboard-charts";
import { adminNavLabel } from "@/lib/admin-navigation";
import { prisma } from "@/lib/prisma";
import { IntlBadge } from "@/components/admin/IntlBadge";
import {
  displayCountry,
  formatPendingApprovalCountryLine,
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
    pendingApprovals,
    registrationActivity,
    pipeline,
    openTickets,
    returnedUsers,
    confirmedUsers,
    kpiSparklines,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: "admin" } } }),
    prisma.user.count({
      where: {
        role: { not: "admin" },
        applicationStatus: APPLICATION_STATUS.APPROVED,
      },
    }),
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
    prisma.user.findMany({
      where: { role: { not: "admin" } },
      orderBy: { createdAt: "desc" },
      take: 8,
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
    prisma.user.findMany({
      where: {
        role: { not: "admin" },
        applicationStatus: APPLICATION_STATUS.PENDING,
      },
      orderBy: { createdAt: "asc" },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        country: true,
        nationality: true,
        unit: { select: { unitName: true } },
      },
    }),
    getRegistrationsByMonth("6m"),
    getStatusDistribution(),
    prisma.supportTicket.count({
      where: {
        status: { in: [TICKET_STATUS.OPEN, TICKET_STATUS.IN_PROGRESS] },
      },
    }),
    prisma.user.count({
      where: {
        role: { not: "admin" },
        applicationStatus: APPLICATION_STATUS.REJECTED,
      },
    }),
    prisma.user.count({
      where: {
        role: { not: "admin" },
        paymentStatus: { in: [PAYMENT_STATUS.VERIFIED, "APPROVED"] },
      },
    }),
    getKpiSparklines(),
  ]);

  const quickActions = [
    {
      href: "/admin/users?filter=pending",
      label: "Participation Requests",
      hint: "Awaiting approval",
      count: pendingUsers,
      Icon: Users,
    },
    {
      href: `/admin/payments?status=${PAYMENT_STATUS.SUBMITTED}`,
      label: "Payment Verification",
      hint: "Proofs to review",
      count: pendingPayments,
      Icon: CreditCard,
    },
    {
      href: `/admin/tickets?status=${TICKET_STATUS.OPEN}`,
      label: "Support Tickets",
      hint: "Open / in progress",
      count: openTickets,
      Icon: LifeBuoy,
    },
    {
      href: "/admin/units",
      label: "Participating Teams",
      hint: "Registered units",
      count: approvedUsers,
      Icon: Shield,
    },
    {
      href: "/admin/users?filter=approved",
      label: "Confirmed participants",
      hint: "Cleared for PATS 2026",
      count: confirmedUsers,
      Icon: CheckCircle2,
    },
    {
      href: "/admin/users?filter=rejected",
      label: "Returned applications",
      hint: "Need re-review",
      count: returnedUsers,
      Icon: RotateCcw,
    },
  ];

  const stats = {
    total: totalUsers,
    approved: approvedUsers,
    pending: pendingUsers,
    payments: pendingPayments,
  };

  return (
    <div className="admin-dashboard-page">
      <section
        aria-label="Quick actions"
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {quickActions.map(({ href, label, hint, count, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              adminSurface,
              "flex items-center justify-between gap-3 p-4 transition hover:shadow-md"
            )}
          >
            <span className="flex items-center gap-3">
              <span className="admin-icon-accent flex h-10 w-10 items-center justify-center rounded-lg bg-cp-parchment">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-cp-ink">
                  {label}
                </span>
                <span className="block text-xs text-cp-ink-muted">{hint}</span>
              </span>
            </span>
            <span className="text-2xl font-bold tabular-nums text-cp-ink">
              {count}
            </span>
          </Link>
        ))}
      </section>

      <AdminDashboardStats stats={stats} series={kpiSparklines} />

      <AdminDashboardCharts
        initialRegistrationActivity={registrationActivity}
        initialPipeline={pipeline.data}
        initialPipelineTotal={pipeline.total}
      />

      <section
        aria-label="Recent activity"
        className="admin-crm-tables-row admin-fade-in-up admin-fade-in-up--delay-5"
      >
        <div className="admin-crm-card admin-crm-card--table">
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
                  {recentRegistrations.slice(0, 4).map((u) => (
                    <tr key={u.id} className="admin-row-hover">
                      <td className="font-semibold text-cp-ink">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="text-sm text-cp-ink-muted">
                        {u.unit?.unitName ?? "—"}
                      </td>
                      <td className="text-sm text-cp-ink-muted">
                        {displayCountry(u.country)}
                        {isInternationalParticipant(u.country) ? (
                          <IntlBadge />
                        ) : null}
                      </td>
                      <td className="text-sm text-cp-ink-muted">
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
        </div>

        <div className="admin-crm-card admin-crm-card--pending">
          <div className="admin-crm-card-header admin-crm-card-header--stack">
            <h2 className="admin-crm-card-title">Pending Approvals</h2>
            <p className="admin-crm-card-subtitle">
              {pendingUsers} user{pendingUsers !== 1 ? "s" : ""} awaiting approval
            </p>
          </div>
          <div className="admin-dashboard-pending-list">
            {pendingApprovals.length === 0 ? (
              <div className="admin-crm-empty">
                <p>No pending approvals</p>
              </div>
            ) : (
              pendingApprovals.map((u) => (
                <div key={u.id} className="admin-dashboard-pending-item">
                  <div className="admin-pending-details">
                    <p className="admin-pending-name">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="admin-pending-meta">{u.email}</p>
                    {u.unit?.unitName ? (
                      <p className="admin-pending-meta">{u.unit.unitName}</p>
                    ) : null}
                    {(() => {
                      const countryLine = formatPendingApprovalCountryLine(
                        u.country,
                        u.nationality
                      );
                      return (
                        <p
                          className="admin-pending-meta"
                          style={
                            countryLine.tone === "international"
                              ? { color: "#ca8a04" }
                              : undefined
                          }
                        >
                          {countryLine.text}
                        </p>
                      );
                    })()}
                  </div>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="admin-dashboard-pending-review"
                  >
                    Review
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
