import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import "@/app/payment-status-timeline.css";
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
} from "@/lib/participant-workflow";
import { getWorkflowSettings } from "@/lib/workflow-settings";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function EventDashboardPage() {
  const session = await requireConfirmedParticipant();

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
  });
  const activeStageIdx = currentWorkflowStageIndex(workflowStages);

  const applicationApproved =
    user.applicationStatus === APPLICATION_STATUS.APPROVED || user.approved;
  const paymentComplete = isPaymentVerified(user.paymentStatus);
  const showPaymentLink = applicationApproved && !user.suspended;

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const activeStage =
    activeStageIdx >= 0 ? workflowStages[activeStageIdx] : null;
  const chip = activeStage
    ? {
        label: activeStage.sub,
        className:
          activeStage.state === "done" ? "" : "participant-dash-welcome__chip--pending",
      }
    : { label: "All stages complete", className: "" };

  const feeNoticeHtml =
    settings?.feeNoticeText &&
    sanitizeNewsContent(
      normalizeBrandingCopy(
        settings.feeNoticeText.replace("NOT", "<strong>NOT</strong>")
      )
    );

  return (
    <div className="participant-dashboard">
      <div className="participant-dash-welcome">
        <div className="min-w-0">
          <p className="participant-dash-welcome__label">Welcome back</p>
          <p className="participant-dash-welcome__name">{fullName}</p>
          <p className="participant-dash-welcome__meta">
            {user.unit?.unitName ?? "Unit not registered"} · {user.email}
          </p>
        </div>
        <div className="participant-dash-welcome__aside">
          <span
            className={`participant-dash-welcome__chip ${chip.className}`.trim()}
          >
            {chip.label}
          </span>
          <Link href="/event/team" className="participant-dash-welcome__team">
            <Users className="h-4 w-4" aria-hidden />
            <span>
              {user._count.teamMembers}{" "}
              {user._count.teamMembers === 1 ? "team member" : "team members"}
            </span>
          </Link>
        </div>
      </div>

      <ParticipantWorkflowPanel stages={workflowStages} />

      {feeNoticeHtml ? (
        <div
          className="portal-alert-warning participant-dashboard__notice"
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
      />

      <div className="participant-dashboard__layout">
        <div className="participant-dashboard__main">
          <ParticipantRegistrationDetailsCard
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
            rank={user.rank}
            createdAt={user.createdAt}
            country={user.country}
            nationality={user.nationality}
            unit={user.unit}
          />

          <section className="portal-card pats-panel">
            <h2 className="portal-h2 mb-3">Data entry periods</h2>
            <p className="mb-3 text-xs font-medium text-red-700">
              Available only after payment has been verified.
            </p>
            {dataEntryPeriods.length === 0 ? (
              <p className="portal-muted text-sm">No periods scheduled yet.</p>
            ) : (
              <ul className="participant-dashboard__dates">
                {dataEntryPeriods.map((p) => (
                  <li key={p.id}>
                    <span className="participant-dashboard__dates-date">
                      {formatDateDisplay(p.openDate)}
                    </span>
                    <span className="participant-dashboard__dates-label">
                      {p.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="participant-dashboard__side">
          {timelineData.deadlines.length > 0 ? (
            <section className="portal-card pats-panel">
              <h2 className="portal-h2 mb-4">Timeline &amp; deadlines</h2>
              <Timeline data={timelineData} compact />
            </section>
          ) : null}

          <section
            className="participant-dashboard__news"
            aria-labelledby="dashboard-news-heading"
          >
            <h3 id="dashboard-news-heading">Latest news</h3>
            <ul>
              {newsPosts.length === 0 ? (
                <li className="portal-muted text-sm">No news posts yet.</li>
              ) : (
                newsPosts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/news/${post.slug}`}>{post.title}</Link>
                    <span className="participant-dashboard__news-date">
                      {formatDateShort(post.publishedAt)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
// Workflow v2: guided multi-stage participant journey.
