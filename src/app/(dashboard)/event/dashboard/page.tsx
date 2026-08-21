import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { normalizeBrandingCopy } from "@/lib/site-copy";
import { formatDateDisplay, formatDateShort } from "@/lib/utils";
import { ParticipantRegistrationDetailsCard } from "@/components/dashboard/ParticipantRegistrationDetailsCard";
import { ParticipantWorkflowPanel } from "@/components/dashboard/ParticipantWorkflowPanel";
import { DashboardStatusBar } from "@/components/dashboard/DashboardStatusBar";
import { getSiteSettings } from "@/lib/site-data";
import { getTimelineData } from "@/lib/timeline";
import { Timeline } from "@/components/timeline/Timeline";
import {
  currentWorkflowStageIndex,
  deriveWorkflowStages,
  resolveRegistrationOverallStage,
} from "@/lib/participant-workflow";
import { getWorkflowSettings } from "@/lib/workflow-settings";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocalizedPublicTickerItems } from "@/lib/cached-public-data";
import { translateDataEntryLabel } from "@/lib/i18n/data-entry-period-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.dashboard };
}

export default async function EventDashboardPage() {
  const session = await requireConfirmedParticipant();
  const { t, locale } = await getDictionary();

  const [
    user,
    tickerUpdates,
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
          rejectionReason: true,
          approvedAt: true,
          rejectedAt: true,
          suspended: true,
          privacyAccepted: true,
          participationConfirmedAt: true,
          participationDeclinedAt: true,
          unitInfoCompletedAt: true,
          teamRegisteredAt: true,
          rosterCompletedAt: true,
          flightsSubmittedAt: true,
          submittedForApprovalAt: true,
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
      // Admin "Ticker Messages" — the participant-facing update feed (the
      // public marquee scrolls Announcements instead). Localized inside the
      // helper, admin-controlled order, expired messages already dropped.
      getLocalizedPublicTickerItems(locale).catch(() => []),
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

  const latestUpdates = tickerUpdates.slice(0, 5);

  const overallStage = resolveRegistrationOverallStage(user);

  const workflowStages = deriveWorkflowStages({
    user,
    settings: workflowSettings,
    teamMemberCount: user._count.teamMembers,
    wf: t.workflow,
  });
  const activeStageIdx = currentWorkflowStageIndex(workflowStages);
  const activeStage =
    activeStageIdx >= 0 ? workflowStages[activeStageIdx] : null;
  /* The status banner's primary action points at whichever step is next; the
     Registration progress cards below cover every other step. */
  const nextStepHref = activeStage
    ? `/event/journey?step=${activeStage.key}`
    : null;

  /* An admin-created account starts with no name — the participant supplies it
     on the unit information step — so fall back to the login rather than
     rendering an empty heading. */
  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email;

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
      </header>

      <ParticipantWorkflowPanel
        stages={workflowStages.filter((s) => s.key !== "hostInfo")}
        t={t.workflowPanel}
      />

      {feeNoticeHtml ? (
        <div
          className="pp-alert pp-alert--warning"
          dangerouslySetInnerHTML={{ __html: feeNoticeHtml }}
        />
      ) : null}

      <DashboardStatusBar
        stage={overallStage}
        rejectionReason={user.rejectionReason}
        approvedAt={user.approvedAt}
        nextStepHref={nextStepHref}
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
            unitOptions={t.unit.options}
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
                    <span className="pp-dates__label">
                      {translateDataEntryLabel(p.label, locale)}
                    </span>
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

          <section className="pp-card" aria-labelledby="dashboard-updates-heading" style={{ borderRadius: "1rem", overflow: "hidden" }}>
            <div className="pp-card__head">
              <div>
                <p className="pp-eyebrow">{t.dashboard.updatesEyebrow}</p>
                <h2
                  id="dashboard-updates-heading"
                  className="pp-card__title"
                  style={{ marginTop: "0.15rem" }}
                >
                  {t.dashboard.latestNews}
                </h2>
              </div>
            </div>
            {latestUpdates.length === 0 ? (
              <p className="pp-muted">{t.dashboard.noNews}</p>
            ) : (
              <ul className="pp-news">
                {latestUpdates.map((item) => (
                  <li key={item.id} className="pp-news__item">
                    <span className="pp-news__link">{item.message}</span>
                    <span className="pp-news__date">
                      {formatDateShort(item.createdAt, locale)}
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
