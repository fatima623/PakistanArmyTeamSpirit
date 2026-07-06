import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import "@/app/admin-user-detail.css";
import { prisma } from "@/lib/prisma";
import { formatDateDisplay, formatDateShort } from "@/lib/utils";
import { AUDIT_ENTITY } from "@/lib/constants";
import { ApplicationReviewPanel } from "@/components/admin/admin-dynamic";
import { AdminResetPassword } from "@/components/admin/AdminResetPassword";
import { AdminRoleSelect } from "@/components/admin/AdminRoleSelect";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { getAdminRole } from "@/lib/admin-session";
import {
  canApproveRegistration,
  canManageSystem,
  roleLabel,
} from "@/lib/auth-routes";
import { AuditLogList } from "@/components/admin/AuditLogList";
import {
  ApplicationStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadges";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { Button } from "@/components/ui/button";
import { adminNavLabel } from "@/lib/admin-navigation";
import { IntlBadge } from "@/components/admin/IntlBadge";
import { displayCountry, isInternationalParticipant } from "@/lib/participant-country";
import { formatRegistrationFee } from "@/lib/payment-settings";

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
      role: true,
      applicationStatus: true,
      paymentStatus: true,
      rejectionReason: true,
      rejectedAt: true,
      approvedAt: true,
      suspended: true,
      privacyAccepted: true,
      privacyAcceptedAt: true,
      createdAt: true,
      unit: true,
      payments: { orderBy: { createdAt: "desc" } },
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
      actor: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  return (
    <div className="admin-user-detail-page">
      <AdminBreadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Participation Requests", href: "/admin/users" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
      />
      <header className="admin-user-detail-hero">
        <div className="admin-user-detail-hero-main">
          <Link href="/admin/users" className="admin-user-detail-back">
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            Back to participation requests
          </Link>
          <h1 className="admin-user-detail-name">
            {user.firstName} {user.lastName}
            {isInternationalParticipant(user.country) ? <IntlBadge /> : null}
          </h1>
          <p className="admin-user-detail-email">{user.email}</p>
          <div className="admin-user-detail-badges">
            <ApplicationStatusBadge status={user.applicationStatus} />
            <PaymentStatusBadge status={user.paymentStatus} />
            {user.suspended ? (
              <span
                className="ops-status-pill ops-status-rejected"
                title="Suspended"
              >
                Suspended
              </span>
            ) : null}
          </div>
        </div>
        {canManageRoles ? (
          <div className="admin-user-detail-hero-actions">
            <DeleteUserButton userId={user.id} />
          </div>
        ) : null}
      </header>

      {canApprove || canManageRoles ? (
        <div className="admin-user-detail-grid admin-user-detail-grid--split">
          {canApprove ? (
            <ApplicationReviewPanel
              userId={user.id}
              applicationStatus={user.applicationStatus}
              paymentStatus={user.paymentStatus}
              rejectionReason={user.rejectionReason}
              suspended={user.suspended}
            />
          ) : null}
          {canManageRoles ? <AdminResetPassword userId={user.id} /> : null}
        </div>
      ) : null}

      <div className="admin-user-detail-grid admin-user-detail-grid--duo">
        <section className="admin-user-detail-card">
          <div className="admin-user-detail-card-header">
            <h3 className="admin-user-detail-card-title">Account details</h3>
          </div>
          <div className="admin-user-detail-card-body">
            <dl className="admin-user-detail-dl">
              <dt>Rank</dt>
              <dd>{user.rank}</dd>
              <dt>Gender</dt>
              <dd>{user.gender}</dd>
              <dt>Country of application</dt>
              <dd>{displayCountry(user.country)}</dd>
              {isInternationalParticipant(user.country) ? (
                <>
                  <dt>Nationality</dt>
                  <dd>{user.nationality?.trim() || "—"}</dd>
                </>
              ) : null}
              <dt>Role</dt>
              <dd>{roleLabel(user.role)}</dd>
              <dt>Privacy</dt>
              <dd>
                {user.privacyAccepted ? "Accepted" : "Not accepted"}
                {user.privacyAcceptedAt
                  ? ` (${formatDateShort(user.privacyAcceptedAt)})`
                  : ""}
              </dd>
              <dt>Registered</dt>
              <dd>{formatDateDisplay(user.createdAt)}</dd>
              {user.approvedAt ? (
                <>
                  <dt>Approved</dt>
                  <dd>{formatDateDisplay(user.approvedAt)}</dd>
                </>
              ) : null}
              {user.rejectedAt ? (
                <>
                  <dt>Returned</dt>
                  <dd>{formatDateDisplay(user.rejectedAt)}</dd>
                </>
              ) : null}
            </dl>
            {canManageRoles ? (
              <div className="mt-4 border-t border-cp-border/60 pt-4">
                <AdminRoleSelect userId={user.id} currentRole={user.role} />
              </div>
            ) : null}
          </div>
        </section>

        {user.unit ? (
          <section className="admin-user-detail-card">
            <div className="admin-user-detail-card-header admin-user-detail-card-header-row">
              <h3 className="admin-user-detail-card-title">Unit details</h3>
              <Link href={`/admin/units/${user.unit.id}/edit`}>
                <Button size="sm" variant="adminOutline">
                  Edit unit
                </Button>
              </Link>
            </div>
            <div className="admin-user-detail-card-body">
              <dl className="admin-user-detail-dl">
                <dt>Unit name</dt>
                <dd>{user.unit.unitName}</dd>
                <dt>Type</dt>
                <dd>{user.unit.unitType}</dd>
                <dt>Branch</dt>
                <dd>{user.unit.branch}</dd>
                <dt>Preferred phase</dt>
                <dd>{user.unit.preferredPhase ?? "—"}</dd>
              </dl>
            </div>
          </section>
        ) : null}
      </div>

      <div className="admin-user-detail-grid admin-user-detail-grid--duo">
      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-header">
          <h3 className="admin-user-detail-card-title">Payments</h3>
          <p className="admin-user-detail-card-desc">
            Submitted fee proofs for this participant.
          </p>
        </div>
        <div className="admin-user-detail-card-body">
          {user.payments.length === 0 ? (
            <p className="admin-user-detail-empty">No payments submitted yet.</p>
          ) : (
            <div className="admin-user-detail-payments-table-wrap">
              <table className="admin-user-detail-payments-table">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Submitted</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {user.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{formatRegistrationFee(p.amount)}</td>
                      <td>
                        <PaymentStatusBadge status={p.status} />
                      </td>
                      <td>{p.transactionReference ?? "—"}</td>
                      <td>{formatDateShort(p.createdAt)}</td>
                      <td>
                        <Link href={`/admin/payments/${p.id}`}>
                          <Button size="sm" variant="adminOutline">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-header">
          <h3 className="admin-user-detail-card-title">Activity history</h3>
        </div>
        <div className="admin-user-detail-card-body">
          <AuditLogList logs={auditLogs} />
        </div>
      </section>
      </div>
    </div>
  );
}
