import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireParticipantSession } from "@/lib/require-participant";
import { teamMemberSelect } from "@/lib/team-members";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";
import { TeamMembersPanel } from "@/components/team/TeamMembersPanel";

export const metadata: Metadata = {
  title: "Team Members",
};

export default async function TeamMembersPage() {
  const session = await requireParticipantSession();

  const teamMembers = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: teamMemberSelect,
  });

  return (
    <div className="team-page">
      <Link href="/event/dashboard" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>
      <PatsPortalHeader
        title="Team Members"
        subtitle="Manage the members participating in the event with your unit."
      />
      <div className="portal-card pats-panel team-page__panel">
        <TeamMembersPanel initialMembers={teamMembers} />
      </div>
    </div>
  );
}
