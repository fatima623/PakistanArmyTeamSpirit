import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { getWorkflowSettings } from "@/lib/workflow-settings";
import {
  canEditFlights,
  isFlightDeadlinePassed,
  isRosterComplete,
  workflowUserSelect,
} from "@/lib/participant-workflow";
import { flightDetailSelect } from "@/lib/flights";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";
import {
  FlightDetailsManager,
  type FlightRecord,
} from "@/components/flights/FlightDetailsManager";

export const metadata: Metadata = {
  title: "Flight Details",
};

export default async function FlightDetailsPage() {
  const session = await requireConfirmedParticipant();

  const [user, settings, flights] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: workflowUserSelect,
    }),
    getWorkflowSettings(),
    prisma.flightDetail.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: flightDetailSelect,
    }),
  ]);

  if (!user) {
    redirect("/event/login");
  }

  const rosterDone = isRosterComplete(user);

  const serializedFlights: FlightRecord[] = flights.map((f) => ({
    id: f.id,
    teamMemberId: f.teamMemberId,
    passengerName: f.passengerName,
    passportNumber: f.passportNumber,
    passportFileName: f.passportFileName,
    passportUploadedAt: f.passportUploadedAt?.toISOString() ?? null,
    ticketFileName: f.ticketFileName,
    ticketUploadedAt: f.ticketUploadedAt?.toISOString() ?? null,
    updatedAt: f.updatedAt.toISOString(),
    teamMember: f.teamMember,
  }));

  return (
    <div className="flex flex-col">
      <Link href="/event/dashboard" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>
      <PatsPortalHeader
        title="Flight Details"
        subtitle="Submit your team's travel information and passport / ticket documents in a single submission."
      />
      {!rosterDone ? (
        <section className="portal-card pats-panel">
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200">
              <Lock className="h-6 w-6 text-slate-500" aria-hidden />
            </span>
            <h2 className="portal-h2">Flight details are locked</h2>
            <p className="mx-auto max-w-md text-sm text-slate-600">
              This stage becomes available automatically once your team member
              roster has been completed.
            </p>
            <Link
              href="/event/team"
              className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
            >
              Go to Team Registration →
            </Link>
          </div>
        </section>
      ) : (
        <FlightDetailsManager
          initialFlights={serializedFlights}
          canEdit={canEditFlights(user, settings)}
          finalized={!!user.flightsFinalizedAt}
          deadlineIso={settings.flightDetailsDeadline?.toISOString() ?? null}
          deadlinePassed={isFlightDeadlinePassed(settings)}
        />
      )}
    </div>
  );
}
