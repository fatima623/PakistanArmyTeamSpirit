import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import {
  Activity,
  Building2,
  CalendarDays,
  Check,
  User,
  Users2,
  Workflow,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { cn, formatDateDisplay, formatDateShort } from "@/lib/utils";
import { AUDIT_ENTITY } from "@/lib/constants";
import { RegistrationVerificationPanel } from "@/components/admin/admin-dynamic";
import { AdminResetPassword } from "@/components/admin/AdminResetPassword";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { TeamRosterDialog } from "@/components/admin/TeamRosterDialog";
import { getAdminRole } from "@/lib/admin-session";
import { canApproveRegistration, canManageSystem } from "@/lib/auth-routes";
import { AuditLogList } from "@/components/admin/AuditLogList";
import {
  ApplicationStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadges";
import { adminNavLabel } from "@/lib/admin-navigation";
import { IntlBadge } from "@/components/admin/IntlBadge";
import { CountryFlag } from "@/components/ui/CountryFlag";
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
    <div className={`flex min-w-0 flex-col gap-[5px] rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-3 ${wide ? "col-span-full" : ""}`.trim()}>
      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">{label}</span>
      <span className="break-words text-[0.9375rem] font-semibold text-slate-900">{value || "—"}</span>
    </div>
  );
}

/** Header status chip — label above badge, boxed (reference: image top-right). */
function HeaderStatusBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-[92px] flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.06em] text-slate-400">
        {label}
      </span>
      {children}
    </div>
  );
}

type WorkflowStep = {
  label: string;
  date: Date | null;
  /** shown under the label when the step has no date yet */
  fallback?: string;
};

/** Numbered progress stepper — completed → green check, current → blue
 *  number, upcoming → gray number (reference: Workflow Progress card). */
function WorkflowStepper({ steps }: { steps: WorkflowStep[] }) {
  const currentIndex = steps.findIndex((s) => !s.date);
  return (
    <ol className="m-0 flex min-w-[520px] list-none items-start p-0">
      {steps.map((step, i) => {
        const done = !!step.date;
        const isCurrent = i === currentIndex;
        return (
          <Fragment key={step.label}>
            {i > 0 ? (
              <li aria-hidden className="flex-1 pt-[13px]">
                <span
                  className={cn(
                    "block h-[2.5px] w-full rounded-full",
                    steps[i - 1].date ? "bg-green-600" : "bg-slate-200"
                  )}
                />
              </li>
            ) : null}
            <li className="flex w-[124px] flex-none flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-[0.75rem] font-bold",
                  done
                    ? "bg-green-600 text-white"
                    : isCurrent
                      ? "bg-sky-600 text-white shadow-[0_0_0_4px_rgba(2,132,199,0.15)]"
                      : "bg-slate-200 text-slate-500"
                )}
                aria-hidden
              >
                {done ? <Check size={15} strokeWidth={3} /> : i + 1}
              </span>
              <span className="text-[0.75rem] font-semibold leading-tight text-slate-800">
                {step.label}
              </span>
              <span className="text-[0.6875rem] leading-tight text-slate-400">
                {step.date
                  ? formatDateDisplay(step.date)
                  : (step.fallback ?? "Pending")}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
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
      teamMembers: {
        select: {
          id: true,
          fullName: true,
          serviceNumber: true,
          rank: true,
          serviceArm: true,
          gender: true,
        },
        orderBy: { createdAt: "asc" },
      },
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

  const workflowSteps: WorkflowStep[] = [
    {
      label: "Participation Confirmed",
      date: user.participationConfirmedAt,
      fallback: user.participationDeclinedAt
        ? `Declined ${formatDateShort(user.participationDeclinedAt)}`
        : "Pending",
    },
    { label: "Team Registered", date: user.teamRegisteredAt },
    { label: "Roster Completed", date: user.rosterCompletedAt },
    { label: "Flight Details", date: user.flightsFinalizedAt },
  ];

  const rosterSummary =
    `${user._count.teamMembers} ${user._count.teamMembers === 1 ? "member" : "members"}` +
    (user.maxTeamMembersOverride
      ? ` (limit raised to ${user.maxTeamMembersOverride})`
      : "") +
    (user.rosterCompletedAt
      ? ` — completed on ${formatDateDisplay(user.rosterCompletedAt)}`
      : " — in progress");

  const flightSummary =
    `${user._count.flightDetails} ${user._count.flightDetails === 1 ? "record" : "records"}` +
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

      {/* —— Profile header ————————————————————————————————— */}
      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <CountryFlag
          country={user.country}
          className="h-[40px] w-[56px] flex-shrink-0 rounded-md border border-gray-200 shadow-sm"
        />

        <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold leading-tight tracking-[-0.01em] text-slate-900">
            {user.firstName} {user.lastName}
            {isInternationalParticipant(user.country) ? <IntlBadge /> : null}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8125rem] text-slate-600">
            {user.rank ? <span>{user.rank}</span> : null}
            {user.gender ? (
              <>
                <span className="h-[3px] w-[3px] rounded-full bg-slate-300" aria-hidden />
                <span>{user.gender}</span>
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 text-[0.8125rem] text-slate-500">
            <CalendarDays size={14} className="flex-shrink-0 text-slate-400" aria-hidden />
            <span>Registered on {formatDateDisplay(user.createdAt)}</span>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <HeaderStatusBox label="Participation">
            <ApplicationStatusBadge
              status={user.applicationStatus}
              showPrefix={false}
            />
          </HeaderStatusBox>
          <HeaderStatusBox label="Payment">
            <PaymentStatusBadge status={user.paymentStatus} showPrefix={false} />
          </HeaderStatusBox>
          <HeaderStatusBox label="Account">
            <span
              className={
                user.suspended
                  ? "ops-status-badge ops-status-rejected"
                  : "ops-status-badge ops-status-approved"
              }
            >
              {user.suspended ? "Suspended" : "Active"}
            </span>
          </HeaderStatusBox>
          {canManageRoles ? <AdminResetPassword userId={user.id} /> : null}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_336px]">
        <main className="flex min-w-0 flex-col gap-4">
          {canApprove ? (
            <RegistrationVerificationPanel
              userId={user.id}
              applicationStatus={user.applicationStatus}
              paymentStatus={user.paymentStatus}
              rejectionReason={user.rejectionReason}
              suspended={user.suspended}
            />
          ) : null}

          {/* —— Account Information ———————————————————————— */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
                <User size={16} aria-hidden />
                Account Information
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

          {/* —— Unit Information ——————————————————————————— */}
          {user.unit ? (
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
                <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
                  <Building2 size={16} aria-hidden />
                  Unit Information
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

          {/* —— Workflow Progress —————————————————————————— */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
                <Workflow size={16} aria-hidden />
                Workflow Progress
              </h3>
            </header>
            <div className="flex flex-col gap-4 p-[18px]">
              <div className="overflow-x-auto pb-1">
                <WorkflowStepper steps={workflowSteps} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-slate-50 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Users2 size={16} className="flex-shrink-0 text-green-700" aria-hidden />
                  <div className="min-w-0">
                    <p className="m-0 text-[0.8125rem] font-bold text-slate-900">
                      Roster
                    </p>
                    <p className="m-0 text-[0.75rem] text-slate-500">
                      {rosterSummary}
                    </p>
                  </div>
                </div>
                <TeamRosterDialog
                  members={user.teamMembers}
                  teamName={user.unit?.unitName}
                />
              </div>

              <p className="m-0 px-0.5 text-[0.75rem] text-slate-400">
                Flight details: {flightSummary}
              </p>
            </div>
          </section>
        </main>

        <aside className="flex min-w-0 flex-col gap-4 lg:self-stretch">
          <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <header className="flex flex-none items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
                <Activity size={16} aria-hidden />
                Activity
              </h3>
            </header>
            <div className="flex-1 p-[18px]">
              <AuditLogList logs={auditLogs} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
