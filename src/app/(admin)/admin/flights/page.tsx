import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/admin-session";
import { canManageSystem, PARTICIPANT_ROLE } from "@/lib/auth-routes";
import { adminNavLabel } from "@/lib/admin-navigation";
import { flightDetailSummarySelect, isFlightRecordComplete } from "@/lib/flights";
import { FlightReviewBoard } from "@/components/admin/FlightReviewBoard";

export const metadata: Metadata = {
  title: adminNavLabel("flights"),
};

/**
 * The review record shown to staff. File PATHS never leave this module — the
 * board only ever learns whether a document is on file (`hasPassport` /
 * `hasTicket`) and opens it through /api/admin/flights/{id}/file.
 */
type FlightRow = {
  id: string;
  passengerName: string;
  passportNumber: string;
  passportFileName: string | null;
  ticketFileName: string | null;
  hasPassport: boolean;
  hasTicket: boolean;
  complete: boolean;
  updatedAt: string;
};

function toFlightRow(flight: {
  id: string;
  passengerName: string;
  passportNumber: string;
  passportFileName: string | null;
  ticketFileName: string | null;
  passportFilePath: string | null;
  ticketFilePath: string | null;
  updatedAt: Date;
}): FlightRow {
  return {
    id: flight.id,
    passengerName: flight.passengerName,
    passportNumber: flight.passportNumber,
    passportFileName: flight.passportFileName,
    ticketFileName: flight.ticketFileName,
    hasPassport: !!flight.passportFilePath,
    hasTicket: !!flight.ticketFilePath,
    complete: isFlightRecordComplete(flight),
    updatedAt: flight.updatedAt.toISOString(),
  };
}

export default async function AdminFlightsPage() {
  const role = await getAdminRole();

  const participants = await prisma.user.findMany({
    where: {
      role: PARTICIPANT_ROLE,
      OR: [
        { rosterCompletedAt: { not: null } },
        { flightDetails: { some: {} } },
      ],
    },
    /* Teams still awaiting finalization sort FIRST, so they can never be the
       rows that fall off the cap — otherwise the sidebar badge (which counts
       every awaiting team) could show a number with no matching row here. */
    orderBy: [{ flightsFinalizedAt: "asc" }, { updatedAt: "desc" }],
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
      // The roster is the source of truth: a traveller who submitted nothing
      // must still show up as a row, so we list members, not flight records.
      teamMembers: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          fullName: true,
          rank: true,
          serviceNumber: true,
          flightDetail: {
            select: {
              ...flightDetailSummarySelect,
              // Server-only: reduced to booleans before reaching the client.
              passportFilePath: true,
              ticketFilePath: true,
            },
          },
        },
      },
      // Legacy team-level rows never linked to a traveller — shown, never dropped.
      flightDetails: {
        where: { teamMemberId: null },
        orderBy: { createdAt: "asc" },
        select: {
          ...flightDetailSummarySelect,
          passportFilePath: true,
          ticketFilePath: true,
        },
      },
    },
  });

  const teams = participants.map((p) => {
    const travellers = p.teamMembers.map((m) => ({
      id: m.id,
      fullName: m.fullName,
      rank: m.rank,
      serviceNumber: m.serviceNumber,
      flight: m.flightDetail ? toFlightRow(m.flightDetail) : null,
    }));

    return {
      id: p.id,
      name: `${p.firstName} ${p.lastName}`.trim(),
      email: p.email,
      country: p.country,
      unitName: p.unit?.unitName ?? null,
      rosterCompletedAt: p.rosterCompletedAt?.toISOString() ?? null,
      flightsFinalizedAt: p.flightsFinalizedAt?.toISOString() ?? null,
      memberCount: travellers.length,
      flightsOnFile: travellers.filter((t) => t.flight !== null).length,
      docsComplete: travellers.filter((t) => t.flight?.complete).length,
      travellers,
      legacyFlights: p.flightDetails.map(toFlightRow),
    };
  });

  return (
    <div className="admin-fade-in-up">
      <header className="mb-5 [&>h2]:text-[1.75rem] [&>h2]:font-bold [&>h2]:tracking-[-0.01em] [&>h2]:text-brand-ink [&>p]:mt-1.5 [&>p]:max-w-[40rem] [&>p]:text-sm [&>p]:leading-normal [&>p]:text-muted-foreground">
        <h2>Flight review</h2>
        <p>
          Review every traveller&apos;s passport and ticket, then finalize the
          team to lock its records. A team can only be finalized once all of its
          travellers have both documents on file.
        </p>
      </header>

      <FlightReviewBoard canFinalize={canManageSystem(role)} teams={teams} />
    </div>
  );
}
