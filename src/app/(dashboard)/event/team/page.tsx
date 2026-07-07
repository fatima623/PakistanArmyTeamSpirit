import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { teamMemberSelect } from "@/lib/team-members";
import { getWorkflowSettings } from "@/lib/workflow-settings";
import {
  canRegisterTeam,
  effectiveTeamLimit,
  getTeamRegistrationWindowState,
  workflowUserSelect,
} from "@/lib/participant-workflow";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";
import { TeamRosterManager } from "@/components/team/TeamRosterManager";

export const metadata: Metadata = {
  title: "Team Registration",
};

export default async function TeamMembersPage() {
  const session = await requireConfirmedParticipant();

  const [user, settings, teamMembers, latestRequest] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: workflowUserSelect,
    }),
    getWorkflowSettings(),
    prisma.teamMember.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: teamMemberSelect,
    }),
    prisma.teamSizeRequest.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        requestedCount: true,
        status: true,
        reviewNote: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) {
    redirect("/event/login");
  }

  const windowState = getTeamRegistrationWindowState(settings);

  return (
    <div className="team-page">
      <Link href="/event/dashboard" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>
      <PatsPortalHeader
        title="Team Registration"
        subtitle="Register your team during the active window, then manage your team member roster."
      />
      <TeamRosterManager
        initialMembers={teamMembers}
        teamRegistered={!!user.teamRegisteredAt}
        rosterCompleted={!!user.rosterCompletedAt}
        flightsFinalized={!!user.flightsFinalizedAt}
        canRegister={canRegisterTeam(user, settings)}
        windowState={windowState}
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
    </div>
  );
}
