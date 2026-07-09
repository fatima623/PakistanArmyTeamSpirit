import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Activity, Building2, User, Workflow } from "lucide-react";

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
    <div className={`flex min-w-0 flex-col gap-[5px] rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-3 transition-colors hover:border-slate-300 hover:bg-white hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] ${wide ? "col-span-full" : ""}`.trim()}>
      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">{label}</span>
      <span className="break-words text-[0.9375rem] font-semibold text-slate-900">{value || "—"}</span>
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
    <div className="flex w-full flex-col gap-4 pb-6">
      <AdminBreadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Participation Requests", href: "/admin/users" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
      />

      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <span className="inline-flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-olive-dark to-brand-olive text-[1.05rem] font-bold tracking-[0.02em] text-white" aria-hidden>
          {`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
            "–"}
        </span>

        <div className="flex min-w-0 flex-[1_1_18rem] flex-col gap-1.5">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold leading-tight tracking-[-0.01em] text-slate-900">
            {user.firstName} {user.lastName}
            {isInternationalParticipant(user.country) ? <IntlBadge /> : null}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[0.8125rem] text-slate-600">
            {user.rank ? <span>{user.rank}</span> : null}
            {user.gender ? (
              <>
                <span className="h-[3px] w-[3px] rounded-full bg-slate-300" aria-hidden />
                <span>{user.gender}</span>
              </>
            ) : null}
            <span className="h-[3px] w-[3px] rounded-full bg-slate-300" aria-hidden />
            <span>{displayCountry(user.country)}</span>
            <span className="h-[3px] w-[3px] rounded-full bg-slate-300" aria-hidden />
            <span>Registered {formatDateShort(user.createdAt)}</span>
          </div>

          <div
            className="mt-1 flex flex-wrap items-start gap-x-4 gap-y-3 border-t border-gray-200 pt-2.5"
            role="group"
            aria-label="Status"
          >
            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">Participation</span>
              <ApplicationStatusBadge
                status={user.applicationStatus}
                showPrefix={false}
              />
            </div>
            <span className="my-0.5 w-px self-stretch bg-gray-200" aria-hidden />
            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">Payment</span>
              <PaymentStatusBadge
                status={user.paymentStatus}
                showPrefix={false}
              />
            </div>
            <span className="my-0.5 w-px self-stretch bg-gray-200" aria-hidden />
            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">Account</span>
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
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <AdminResetPassword userId={user.id} />
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_336px] lg:items-start">
        <main className="flex min-w-0 flex-col gap-4">
          {canApprove ? (
            <ApplicationReviewPanel
              userId={user.id}
              applicationStatus={user.applicationStatus}
              paymentStatus={user.paymentStatus}
              rejectionReason={user.rejectionReason}
              suspended={user.suspended}
            />
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)]">
            <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
                <User size={16} aria-hidden />
                Account
              </h3>
            </header>
            <div className="p-[18px]">
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
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
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)]">
              <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
                <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
                  <Building2 size={16} aria-hidden />
                  Unit
                </h3>
              </header>
              <div className="p-[18px]">
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
                  <Field label="Unit name" value={user.unit.unitName} />
                  <Field label="Type" value={user.unit.unitType} />
                  <Field label="Branch" value={user.unit.branch} />
                  <Field label="Arm" value={user.unit.arm} />
                </div>
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)]">
            <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
                <Workflow size={16} aria-hidden />
                Workflow progress
              </h3>
            </header>
            <div className="p-[18px]">
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
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

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)] [&>*:last-child]:!pb-3">
            <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
                <Activity size={16} aria-hidden />
                Activity
              </h3>
            </header>
            <div className="p-[18px]">
              <AuditLogList logs={auditLogs} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
