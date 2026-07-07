import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/admin-session";
import { canManageSystem } from "@/lib/auth-routes";
import { adminNavLabel } from "@/lib/admin-navigation";
import { TeamSizeRequestsBoard } from "@/components/admin/TeamSizeRequestsBoard";

export const metadata: Metadata = {
  title: adminNavLabel("teamRequests"),
};

export default async function AdminTeamRequestsPage() {
  const role = await getAdminRole();

  const requests = await prisma.teamSizeRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          maxTeamMembersOverride: true,
          unit: { select: { unitName: true } },
          _count: { select: { teamMembers: true } },
        },
      },
      reviewedBy: {
        select: { firstName: true, lastName: true, role: true },
      },
    },
  });

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { maxTeamMembers: true },
  });

  return (
    <div className="admin-fade-in-up">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="admin-users-panel-title">Team size requests</h2>
          <p className="admin-users-page-desc">
            Participant justifications to exceed the team-member cap (default{" "}
            {settings?.maxTeamMembers ?? 13}). Approval raises the
            participant&apos;s limit to the requested size.
          </p>
        </div>
        <span className="admin-users-count-badge">
          {requests.filter((r) => r.status === "PENDING").length} pending
        </span>
      </header>

      <TeamSizeRequestsBoard
        canDecide={canManageSystem(role)}
        requests={requests.map((r) => ({
          id: r.id,
          requestedCount: r.requestedCount,
          justification: r.justification,
          status: r.status,
          reviewNote: r.reviewNote,
          reviewedAt: r.reviewedAt?.toISOString() ?? null,
          createdAt: r.createdAt.toISOString(),
          reviewedBy: r.reviewedBy
            ? {
                name: `${r.reviewedBy.firstName} ${r.reviewedBy.lastName}`.trim(),
                role: r.reviewedBy.role,
              }
            : null,
          user: {
            id: r.user.id,
            name: `${r.user.firstName} ${r.user.lastName}`.trim(),
            email: r.user.email,
            unitName: r.user.unit?.unitName ?? null,
            currentMembers: r.user._count.teamMembers,
            currentLimit:
              r.user.maxTeamMembersOverride ?? settings?.maxTeamMembers ?? 13,
          },
        }))}
      />
    </div>
  );
}
