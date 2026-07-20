import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Home,
  ShieldCheck,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireParticipantSession } from "@/lib/require-participant";
import { getWorkflowSettings } from "@/lib/workflow-settings";
import {
  WORKFLOW_STAGES,
  currentWorkflowStageIndex,
  deriveWorkflowStages,
  canEditFlights,
  canRegisterTeam,
  effectiveTeamLimit,
  getTeamRegistrationWindowState,
  isConfirmationDeadlinePassed,
  isFlightDeadlinePassed,
  type WorkflowStageKey,
} from "@/lib/participant-workflow";
import { APPLICATION_STATUS, isPaymentVerified } from "@/lib/constants";
import { getParticipantPaymentData } from "@/lib/participant-payment-data";
import { getDeadlines, paymentClosedByDeadline } from "@/lib/deadlines";
import { teamMemberSelect } from "@/lib/team-members";
import { flightDetailSelect } from "@/lib/flights";
import { formatDateDisplay } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";
import { ParticipationConfirmCard } from "@/components/dashboard/ParticipationConfirmCard";
import { ParticipantRegistrationDetailsCard } from "@/components/dashboard/ParticipantRegistrationDetailsCard";
import { PaymentSubmissionForm } from "@/components/dashboard/PaymentSubmissionForm";
import { TeamRosterManager } from "@/components/team/TeamRosterManager";
import {
  FlightDetailsManager,
  type FlightRecord,
} from "@/components/flights/FlightDetailsManager";
import { ApplicationStatusBadge } from "@/components/admin/StatusBadges";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.journey };
}

type SearchParams = Promise<{ step?: string }>;

/** Green “step complete” banner used by read-only wizard steps. */
function StepDoneBanner({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3.5 rounded-2xl border-l-4 border border-emerald-200 border-l-emerald-600 bg-emerald-50/70 px-5 py-4">
      <span
        className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-emerald-600 text-white"
        aria-hidden
      >
        <CheckCircle2 className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[0.9375rem] font-bold leading-snug text-emerald-800">
          {title}
        </p>
        {sub ? (
          <p className="m-0 mt-1 text-[0.8125rem] leading-relaxed text-slate-600">
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireParticipantSession();
  const params = await searchParams;
  const { t, locale } = await getDictionary();
  const j = t.journey;

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        rank: true,
        country: true,
        nationality: true,
        createdAt: true,
        approved: true,
        applicationStatus: true,
        paymentStatus: true,
        rejectionReason: true,
        suspended: true,
        participationConfirmedAt: true,
        participationDeclinedAt: true,
        teamRegisteredAt: true,
        rosterCompletedAt: true,
        maxTeamMembersOverride: true,
        flightsFinalizedAt: true,
        unit: { select: { unitName: true, branch: true, bdeOrFmn: true } },
        _count: { select: { teamMembers: true } },
      },
    }),
    getWorkflowSettings(),
  ]);

  if (!user) {
    redirect("/event/login");
  }

  const stages = deriveWorkflowStages({
    user,
    settings,
    teamMemberCount: user._count.teamMembers,
    wf: t.workflow,
  });

  /* —— Resolve the requested step (locked steps bounce to the active one) —— */
  const requested = params.step as WorkflowStageKey | undefined;
  const currentIdx = currentWorkflowStageIndex(stages);
  const lastUnlocked = [...stages].reverse().find((s) => s.state !== "locked");
  const defaultKey =
    currentIdx >= 0
      ? stages[currentIdx].key
      : (lastUnlocked?.key ?? stages[0].key);

  const requestedStage =
    requested && WORKFLOW_STAGES.includes(requested)
      ? stages.find((s) => s.key === requested)
      : undefined;

  if (!requestedStage) {
    redirect(`/event/journey?step=${defaultKey}`);
  }
  if (requestedStage.state === "locked") {
    redirect(`/event/journey?step=${defaultKey}`);
  }

  const stepKey = requestedStage.key;

  /* —— Per-step data ————————————————————————————————————————— */
  const needsTeam = stepKey === "roster";
  /* Flight details are filed one record per traveller, so the flights step
     needs the roster too — it renders a row per member. */
  const needsRoster = needsTeam || stepKey === "flights";
  const [paymentData, deadlines, teamMembers, latestRequest, flights] =
    await Promise.all([
      stepKey === "payment" ? getParticipantPaymentData(user.id) : null,
      stepKey === "payment" ? getDeadlines() : null,
      needsRoster
        ? prisma.teamMember.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "asc" },
            select: teamMemberSelect,
          })
        : null,
      needsTeam
        ? prisma.teamSizeRequest.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              requestedCount: true,
              status: true,
              reviewNote: true,
              createdAt: true,
            },
          })
        : null,
      stepKey === "flights"
        ? prisma.flightDetail.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "asc" },
            select: flightDetailSelect,
          })
        : null,
    ]);

  let content: React.ReactNode = null;

  if (user.suspended) {
    content = (
      <section className="pp-card">
        <p className="m-0 text-sm leading-relaxed text-slate-700">
          {j.suspended}
        </p>
      </section>
    );
  } else if (stepKey === "confirmation") {
    content = user.participationConfirmedAt ? (
      <section>
        <StepDoneBanner
          title={j.banners.participationConfirmed}
          sub={j.banners.confirmedOnSub(
            formatDateDisplay(user.participationConfirmedAt, locale),
            user.unit?.unitName ?? null
          )}
        />
        <ParticipantRegistrationDetailsCard
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
          rank={user.rank}
          createdAt={user.createdAt}
          country={user.country}
          nationality={user.nationality}
          unit={user.unit}
          t={t.registration}
          locale={locale}
        />
      </section>
    ) : (
      <ParticipationConfirmCard
        firstName={user.firstName}
        lastName={user.lastName}
        unitName={user.unit?.unitName ?? null}
        deadlineIso={settings.participationConfirmDeadline?.toISOString() ?? null}
        initialExpired={isConfirmationDeadlinePassed(settings)}
        previouslyDeclined={!!user.participationDeclinedAt}
      />
    );
  } else if (stepKey === "verification") {
    const approved =
      user.applicationStatus === APPLICATION_STATUS.APPROVED || user.approved;
    content = (
      <section className="flex flex-col gap-4">
        {approved ? (
          <StepDoneBanner
            title={j.banners.verifiedBySd}
            sub={j.banners.verifiedBySdSub}
          />
        ) : (
          <div className="pp-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700"
                  aria-hidden
                >
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="m-0 text-[0.9375rem] font-bold text-slate-900">
                    {j.banners.registrationVerification}
                  </h2>
                  <p className="m-0 mt-0.5 text-[0.8125rem] text-slate-500">
                    {requestedStage.sub}
                  </p>
                </div>
              </div>
              <ApplicationStatusBadge
                status={user.applicationStatus}
                showPrefix={false}
              />
            </div>
            {user.rejectionReason &&
            (user.applicationStatus === APPLICATION_STATUS.RETURNED ||
              user.applicationStatus === APPLICATION_STATUS.REJECTED) ? (
              <p className="m-0 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[0.8125rem] leading-[1.5] text-amber-900">
                <span className="font-bold">{j.banners.messageFromSd}</span>{" "}
                {user.rejectionReason}
              </p>
            ) : null}
          </div>
        )}
        <ParticipantRegistrationDetailsCard
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
          rank={user.rank}
          createdAt={user.createdAt}
          country={user.country}
          nationality={user.nationality}
          unit={user.unit}
          t={t.registration}
          locale={locale}
        />
      </section>
    );
  } else if (stepKey === "payment") {
    const verified = isPaymentVerified(user.paymentStatus);
    const deadlinePassed =
      !verified && !!deadlines && paymentClosedByDeadline(deadlines);
    content = (
      <section className="flex flex-col gap-4">
        {verified ? (
          <StepDoneBanner
            title={j.banners.paymentVerifiedMt}
            sub={j.banners.paymentVerifiedMtSub}
          />
        ) : null}
        {deadlinePassed ? (
          <div className="pp-card">
            <p className="m-0 text-sm leading-relaxed text-slate-700">
              {j.banners.paymentDeadlinePassed}
            </p>
          </div>
        ) : paymentData ? (
          <PaymentSubmissionForm initialData={paymentData} />
        ) : (
          <div className="pp-card">
            <p className="m-0 text-sm leading-relaxed text-slate-700">
              {j.banners.noPaymentInfo}
            </p>
          </div>
        )}
      </section>
    );
  } else if (needsTeam) {
    content = (
      <section className="flex flex-col gap-4">
        {user.rosterCompletedAt ? (
          <StepDoneBanner
            title={j.banners.rosterCompleted}
            sub={j.banners.rosterCompletedSub(
              user._count.teamMembers,
              formatDateDisplay(user.rosterCompletedAt, locale)
            )}
          />
        ) : null}
        <TeamRosterManager
          hideHeading
          initialMembers={teamMembers ?? []}
          teamRegistered={!!user.teamRegisteredAt}
          rosterCompleted={!!user.rosterCompletedAt}
          flightsFinalized={!!user.flightsFinalizedAt}
          canRegister={canRegisterTeam(user, settings)}
          windowState={getTeamRegistrationWindowState(settings)}
          windowOpenIso={settings.teamRegistrationOpenDate?.toISOString() ?? null}
          windowCloseIso={
            settings.teamRegistrationCloseDate?.toISOString() ?? null
          }
          limit={effectiveTeamLimit(user, settings)}
          latestRequest={
            latestRequest
              ? {
                  ...latestRequest,
                  createdAt: latestRequest.createdAt.toISOString(),
                }
              : null
          }
        />
      </section>
    );
  } else if (stepKey === "flights") {
    const serializedFlights: FlightRecord[] = (flights ?? []).map((f) => ({
      id: f.id,
      teamMemberId: f.teamMemberId,
      passengerName: f.passengerName,
      passportNumber: f.passportNumber,
      passportFileName: f.passportFileName,
      passportFileSize: f.passportFileSize ?? null,
      passportUploadedAt: f.passportUploadedAt?.toISOString() ?? null,
      ticketFileName: f.ticketFileName,
      ticketFileSize: f.ticketFileSize ?? null,
      ticketUploadedAt: f.ticketUploadedAt?.toISOString() ?? null,
      updatedAt: f.updatedAt.toISOString(),
      teamMember: f.teamMember,
    }));
    content = (
      <FlightDetailsManager
        initialFlights={serializedFlights}
        members={teamMembers ?? []}
        canEdit={canEditFlights(user, settings)}
        finalized={!!user.flightsFinalizedAt}
        deadlineIso={settings.flightDetailsDeadline?.toISOString() ?? null}
        deadlinePassed={isFlightDeadlinePassed(settings)}
      />
    );
  } else {
    // hostInfo
    const available = !!user.flightsFinalizedAt && settings.hostInfoPublished;
    content = (
      <section className="pp-card">
        <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${available ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"}`}
            aria-hidden
          >
            <Home className="h-6 w-6" />
          </span>
          <h2 className="m-0 text-[1.05rem] font-bold text-slate-900">
            {j.banners.hostInfoTitle}
          </h2>
          <p className="m-0 mx-auto max-w-md text-sm leading-relaxed text-slate-600">
            {available ? j.banners.hostInfoAvailable : j.banners.hostInfoLocked}
          </p>
          {available ? (
            <Link
              href="/event/host-info"
              className="pp-btn pp-btn--primary no-underline"
            >
              {j.banners.openHostInfo}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  const header = j.headers[stepKey];

  return (
    <div className="flex flex-col">
      <Link href="/event/dashboard" className="portal-back-link mb-3">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t.common.backToDashboard}
      </Link>
      <PatsPortalHeader
        eyebrow={header.eyebrow || undefined}
        title={header.title}
        subtitle={header.subtitle}
      />
      <div className="pp-section-flow">{content}</div>
    </div>
  );
}
