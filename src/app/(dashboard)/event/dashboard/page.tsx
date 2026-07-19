import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { normalizeBrandingCopy } from "@/lib/site-copy";
import { formatDateDisplay, formatDateShort } from "@/lib/utils";
import { ParticipantRegistrationDetailsCard } from "@/components/dashboard/ParticipantRegistrationDetailsCard";
import { ParticipantWorkflowPanel } from "@/components/dashboard/ParticipantWorkflowPanel";
import { DashboardStatusBar } from "@/components/dashboard/DashboardStatusBar";
import { APPLICATION_STATUS, isPaymentVerified } from "@/lib/constants";
import { getSiteSettings } from "@/lib/site-data";
import { getTimelineData } from "@/lib/timeline";
import { Timeline } from "@/components/timeline/Timeline";
import { resolveParticipantJourneyStage } from "@/lib/participant-journey";
import {
  currentWorkflowStageIndex,
  deriveWorkflowStages,
  effectiveTeamLimit,
} from "@/lib/participant-workflow";
import { getWorkflowSettings } from "@/lib/workflow-settings";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.dashboard };
}

export default async function EventDashboardPage() {
  const session = await requireConfirmedParticipant();
  const { t, locale } = await getDictionary();

  const [
    user,
    newsPosts,
    settings,
    siteSettings,
    dataEntryPeriods,
    timelineData,
    workflowSettings,
  ] = await Promise.all([
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
          approvedAt: true,
          rejectedAt: true,
          suspended: true,
          privacyAccepted: true,
          participationConfirmedAt: true,
          participationDeclinedAt: true,
          teamRegisteredAt: true,
          rosterCompletedAt: true,
          maxTeamMembersOverride: true,
          flightsFinalizedAt: true,
          unit: {
            select: {
              unitName: true,
              branch: true,
              bdeOrFmn: true,
            },
          },
          _count: { select: { teamMembers: true } },
        },
      }),
      prisma.newsPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { id: true, slug: true, title: true, publishedAt: true },
      }),
      prisma.siteSettings.findUnique({
        where: { id: "singleton" },
        select: { feeNoticeText: true },
      }),
      getSiteSettings(),
      prisma.dataEntryPeriod.findMany({ orderBy: { openDate: "asc" } }),
      getTimelineData(),
      getWorkflowSettings(),
    ]);

  if (!user) {
    redirect("/event/login");
  }

  const stage = resolveParticipantJourneyStage({
    applicationStatus: user.applicationStatus,
    paymentStatus: user.paymentStatus,
    approved: user.approved,
  });

  const workflowStages = deriveWorkflowStages({
    user,
    settings: workflowSettings,
    teamMemberCount: user._count.teamMembers,
    wf: t.workflow,
  });
  const activeStageIdx = currentWorkflowStageIndex(workflowStages);

  const applicationApproved =
    user.applicationStatus === APPLICATION_STATUS.APPROVED || user.approved;
  const paymentComplete = isPaymentVerified(user.paymentStatus);
  const showPaymentLink = applicationApproved && !user.suspended;

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const activeStage =
    activeStageIdx >= 0 ? workflowStages[activeStageIdx] : null;
  const chipLabel = activeStage ? activeStage.sub : t.dashboard.allStagesComplete;
  const chipPending = activeStage ? activeStage.state !== "done" : false;

  const teamLimit = effectiveTeamLimit(user, workflowSettings);


  const feeNoticeHtml =
    settings?.feeNoticeText &&
    sanitizeNewsContent(
      normalizeBrandingCopy(
        settings.feeNoticeText.replace("NOT", "<strong>NOT</strong>")
      )
    );

  return (
    <>
      <header className="pp-hero">
        <div className="min-w-0">
          <p className="pp-hero__eyebrow">{t.dashboard.welcomeBack}</p>
          <h1 className="pp-hero__title">{fullName}</h1>
          <p className="pp-hero__meta">
            {user.unit?.unitName ?? t.dashboard.unitNotRegistered} · {user.email}
          </p>
        </div>
        <div className="pp-hero__aside">
          <span
            className={`pp-hero__chip ${chipPending ? "pp-hero__chip--pending" : ""}`.trim()}
          >
            {chipLabel}
          </span>
          <Link href="/event/team" className="pp-hero__team">
            <Users className="h-4 w-4" aria-hidden />
            <span>{t.dashboard.membersCount(user._count.teamMembers)}</span>
          </Link>
        </div>
      </header>



      <ParticipantWorkflowPanel stages={workflowStages} t={t.workflowPanel} />

      {feeNoticeHtml ? (
        <div
          className="pp-alert pp-alert--warning"
          dangerouslySetInnerHTML={{ __html: feeNoticeHtml }}
        />
      ) : null}

      <DashboardStatusBar
        stage={stage}
        rejectionReason={user.rejectionReason}
        approvedAt={user.approvedAt}
        canAccessPayment={showPaymentLink}
        paymentComplete={paymentComplete}
        exerciseDates={siteSettings.exerciseDates}
        t={t.statusBar}
        locale={locale}
      />

      <div className="pp-grid">
        <div className="pp-grid__col">
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

          <section className="pp-card" style={{ borderRadius: "1rem", overflow: "hidden" }}>
            <div className="pp-card__head">
              <div>
                <p className="pp-eyebrow">{t.dashboard.scheduleEyebrow}</p>
                <h2 className="pp-card__title" style={{ marginTop: "0.15rem" }}>
                  {t.dashboard.dataEntryPeriods}
                </h2>
                <p className="pp-card__desc">
                  {t.dashboard.dataEntryDesc}
                </p>
              </div>
            </div>
            {dataEntryPeriods.length === 0 ? (
              <p className="pp-muted">{t.dashboard.noPeriods}</p>
            ) : (
              <ul className="pp-dates">
                {dataEntryPeriods.map((p) => (
                  <li key={p.id} className="pp-dates__item">
                    <span className="pp-dates__date">
                      {formatDateDisplay(p.openDate, locale)}
                    </span>
                    <span className="pp-dates__label">{p.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="pp-grid__col">
          {timelineData.deadlines.length > 0 ? (
            <section className="pp-card" style={{ borderRadius: "1rem", overflow: "hidden" }}>
              <div className="pp-card__head">
                <div>
                  <p className="pp-eyebrow">{t.dashboard.deadlinesEyebrow}</p>
                  <h2 className="pp-card__title" style={{ marginTop: "0.15rem" }}>
                    {t.dashboard.timeline}
                  </h2>
                </div>
              </div>
              <Timeline
                data={timelineData}
                compact
                t={t.dashboard.timelinePanel}
                locale={locale}
              />
            </section>
          ) : null}

          <section className="pp-card" aria-labelledby="dashboard-news-heading" style={{ borderRadius: "1rem", overflow: "hidden" }}>
            <div className="pp-card__head">
              <div>
                <p className="pp-eyebrow">{t.dashboard.updatesEyebrow}</p>
                <h2
                  id="dashboard-news-heading"
                  className="pp-card__title"
                  style={{ marginTop: "0.15rem" }}
                >
                  {t.dashboard.latestNews}
                </h2>
              </div>
            </div>
            {newsPosts.length === 0 ? (
              <p className="pp-muted">{t.dashboard.noNews}</p>
            ) : (
              <ul className="pp-news">
                {newsPosts.map((post) => (
                  <li key={post.id} className="pp-news__item">
                    <Link href={`/news/${post.slug}`} className="pp-news__link">
                      {post.title}
                    </Link>
                    <span className="pp-news__date">
                      {formatDateShort(post.publishedAt, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
// Workflow v2: guided multi-stage participant journey.
