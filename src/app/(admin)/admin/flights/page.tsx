import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/admin-session";
import { canManageSystem } from "@/lib/auth-routes";
import { adminNavLabel } from "@/lib/admin-navigation";
import { flightDetailSelect } from "@/lib/flights";
import { FlightReviewBoard } from "@/components/admin/FlightReviewBoard";

export const metadata: Metadata = {
  title: adminNavLabel("flights"),
};

export default async function AdminFlightsPage() {
  const role = await getAdminRole();

  const participants = await prisma.user.findMany({
    where: {
      role: "user",
      OR: [
        { rosterCompletedAt: { not: null } },
        { flightDetails: { some: {} } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 300,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      country: true,
      rosterCompletedAt: true,
      flightsFinalizedAt: true,
      unit: { select: { unitName: true } },
      _count: { select: { teamMembers: true } },
      flightDetails: {
        orderBy: { createdAt: "asc" },
        select: flightDetailSelect,
      },
    },
  });

  return (
    <div className="admin-fade-in-up">
      <FlightReviewBoard
        canFinalize={canManageSystem(role)}
        participants={participants.map((p) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`.trim(),
          email: p.email,
          country: p.country,
          unitName: p.unit?.unitName ?? null,
          memberCount: p._count.teamMembers,
          rosterCompletedAt: p.rosterCompletedAt?.toISOString() ?? null,
          flightsFinalizedAt: p.flightsFinalizedAt?.toISOString() ?? null,
          flights: p.flightDetails.map((f) => ({
            id: f.id,
            passengerName: f.passengerName,
            passportNumber: f.passportNumber,
            passportFileName: f.passportFileName,
            ticketFileName: f.ticketFileName,
            updatedAt: f.updatedAt.toISOString(),
            traveler: f.teamMember
              ? `${f.teamMember.rank ? `${f.teamMember.rank} ` : ""}${f.teamMember.fullName}`
              : null,
          })),
        }))}
      />
    </div>
  );
}
