import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Activity, Building2, User, Workflow } from "lucide-react";

import "@/app/admin-user-detail.css";
import { prisma } from "@/lib/prisma";
import { formatDateDisplay, formatDateShort } from "@/lib/utils";
import { AUDIT_ENTITY } from "@/lib/constants";
import { ApplicationReviewPanel } from "@/components/admin/admin-dynamic";
import { AdminResetPassword } from "@/components/admin/AdminResetPassword";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { getAdminRole } from "@/lib/admin-session";
import { canApproveRegistration, canManageSystem } from "@/lib/auth-routes";
import { AuditLogList } from "@/components/admin/AuditLogList";
import {
  ApplicationStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadges";
import { adminNavLabel } from "@/lib/admin-navigation";
import { IntlBadge } from "@/components/admin/IntlBadge";
import {
  displayCountry,
  isInternationalParticipant,
} from "@/lib/participant-country";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { firstName: true, lastName: true },
  });
  return {
    title: user
      ? `${user.firstName} ${user.lastName} — ${adminNavLabel("users")}`
      : adminNavLabel("users"),
  };
}

/** One labelled stat tile — laid out in a responsive grid inside a section. */
function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`admin-pr-stat ${wide ? "admin-pr-stat--wide" : ""}`.trim()}>
      <span className="admin-pr-stat__label">{label}</span>
      <span className="admin-pr-stat__value">{value || "—"}</span>
    </div>
  );
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      rank: true,
      gender: true,
      country: true,
      nationality: true,
      applicationStatus: true,
      paymentStatus: true,
      rejectionReason: true,
      rejectedAt: true,
      approvedAt: true,
      suspended: true,
      participationConfirmedAt: true,
      participationDeclinedAt: true,
      teamRegisteredAt: true,
      rosterCompletedAt: true,
      maxTeamMembersOverride: true,
      flightsFinalizedAt: true,
      createdAt: true,
      unit: true,
      _count: { select: { teamMembers: true, flightDetails: true } },
    },
  });

  if (!user) {
    notFound();
  }

  const viewerRole = await getAdminRole();
  const canManageRoles = canManageSystem(viewerRole);
  const canApprove = canApproveRegistration(viewerRole);

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: AUDIT_ENTITY.USER, entityId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  const participationValue = user.participationConfirmedAt
    ? formatDateDisplay(user.participationConfirmedAt)
    : user.participationDeclinedAt
      ? `Declined ${formatDateDisplay(user.participationDeclinedAt)}`
      : "Not yet";

  const teamRegisteredValue = user.teamRegisteredAt
    ? formatDateDisplay(user.teamRegisteredAt)
    : "Not yet";

  const rosterValue =
    `${user._count.teamMembers} member${user._count.teamMembers === 1 ? "" : "s"}` +
    (user.maxTeamMembersOverride
      ? ` (limit raised to ${user.maxTeamMembersOverride})`
      : "") +
    (user.rosterCompletedAt
      ? ` — completed ${formatDateShort(user.rosterCompletedAt)}`
      : " — in progress");

  const flightValue =
    `${user._count.flightDetails} record${user._count.flightDetails === 1 ? "" : "s"}` +
    (user.flightsFinalizedAt
      ? ` — finalized ${formatDateShort(user.flightsFinalizedAt)}`
      : " — not finalized");

  return (
    <div className="admin-pr-page">
      <AdminBreadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Participation Requests", href: "/admin/users" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
      />

      <section className="admin-pr-summary">
        <span className="admin-pr-summary__avatar" aria-hidden>
          {`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
            "–"}
        </span>

        <div className="admin-pr-summary__id">
          <h1 className="admin-pr-summary__name">
            {user.firstName} {user.lastName}
            {isInternationalParticipant(user.country) ? <IntlBadge /> : null}
          </h1>

          <div className="admin-pr-summary__meta">
            {user.rank ? <span>{user.rank}</span> : null}
            {user.gender ? (
              <>
                <span className="admin-pr-summary__meta-dot" aria-hidden />
                <span>{user.gender}</span>
              </>
            ) : null}
            <span className="admin-pr-summary__meta-dot" aria-hidden />
            <span>{displayCountry(user.country)}</span>
            <span className="admin-pr-summary__meta-dot" aria-hidden />
            <span>Registered {formatDateShort(user.createdAt)}</span>
          </div>

          <div
            className="admin-pr-status-group"
            role="group"
            aria-label="Status"
          >
            <div className="admin-pr-status">
              <span className="admin-pr-status__label">Participation</span>
              <ApplicationStatusBadge
                status={user.applicationStatus}
                showPrefix={false}
              />
            </div>
            <span className="admin-pr-status__sep" aria-hidden />
            <div className="admin-pr-status">
              <span className="admin-pr-status__label">Payment</span>
              <PaymentStatusBadge
                status={user.paymentStatus}
                showPrefix={false}
              />
            </div>
            <span className="admin-pr-status__sep" aria-hidden />
            <div className="admin-pr-status">
              <span className="admin-pr-status__label">Account</span>
              <span
                className={
                  user.suspended
                    ? "ops-status-badge ops-status-rejected"
                    : "ops-status-badge ops-status-approved"
                }
              >
                {user.suspended ? "Suspended" : "Active"}
              </span>
            </div>
          </div>
        </div>

        {canManageRoles ? (
          <div className="admin-pr-summary__right">
            <AdminResetPassword userId={user.id} />
          </div>
        ) : null}
      </section>

      <div className="admin-pr-layout">
        <main className="admin-pr-main">
          {canApprove ? (
            <ApplicationReviewPanel
              userId={user.id}
              applicationStatus={user.applicationStatus}
              paymentStatus={user.paymentStatus}
              rejectionReason={user.rejectionReason}
              suspended={user.suspended}
            />
          ) : null}

          <section className="admin-pr-card">
            <header className="admin-pr-card__header">
              <h3 className="admin-pr-card__title">
                <User size={16} aria-hidden />
                Account
              </h3>
            </header>
            <div className="admin-pr-card__body">
              <div className="admin-pr-stats">
                <Field label="Rank" value={user.rank} />
                <Field label="Gender" value={user.gender} />
                <Field label="Country" value={displayCountry(user.country)} />
                {isInternationalParticipant(user.country) ? (
                  <Field
                    label="Nationality"
                    value={user.nationality?.trim() || "—"}
                  />
                ) : null}
                <Field
                  label="Registered"
                  value={formatDateDisplay(user.createdAt)}
                />
                {user.approvedAt ? (
                  <Field
                    label="Approved"
                    value={formatDateDisplay(user.approvedAt)}
                  />
                ) : null}
                {user.rejectedAt ? (
                  <Field
                    label="Returned"
                    value={formatDateDisplay(user.rejectedAt)}
                  />
                ) : null}
              </div>
            </div>
          </section>

          {user.unit ? (
            <section className="admin-pr-card">
              <header className="admin-pr-card__header">
                <h3 className="admin-pr-card__title">
                  <Building2 size={16} aria-hidden />
                  Unit
                </h3>
              </header>
              <div className="admin-pr-card__body">
                <div className="admin-pr-stats">
                  <Field label="Unit name" value={user.unit.unitName} />
                  <Field label="Type" value={user.unit.unitType} />
                  <Field label="Branch" value={user.unit.branch} />
                  <Field label="Arm" value={user.unit.arm} />
                </div>
              </div>
            </section>
          ) : null}

          <section className="admin-pr-card">
            <header className="admin-pr-card__header">
              <h3 className="admin-pr-card__title">
                <Workflow size={16} aria-hidden />
                Workflow progress
              </h3>
            </header>
            <div className="admin-pr-card__body">
              <div className="admin-pr-stats">
                <Field
                  label="Participation confirmed"
                  value={participationValue}
                />
                <Field label="Team registered" value={teamRegisteredValue} />
                <Field label="Roster" value={rosterValue} wide />
                <Field label="Flight details" value={flightValue} wide />
              </div>
            </div>
          </section>
        </main>

        <aside className="admin-pr-aside">
          <section className="admin-pr-card admin-pr-card--activity">
            <header className="admin-pr-card__header">
              <h3 className="admin-pr-card__title">
                <Activity size={16} aria-hidden />
                Activity
              </h3>
            </header>
            <div className="admin-pr-card__body">
              <AuditLogList logs={auditLogs} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
