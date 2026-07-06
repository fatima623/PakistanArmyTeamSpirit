import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireParticipantSession } from "@/lib/require-participant";
import { getTimelineData } from "@/lib/timeline";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";
import {
  PortalTimeline,
  type PortalTimelineEvent,
  type PortalTimelineStatus,
} from "@/components/timeline/PortalTimeline";
import { APPLICATION_STATUS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Timeline",
};

export default async function ParticipantTimelinePage() {
  const session = await requireParticipantSession();
  const [data, user] = await Promise.all([
    getTimelineData(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        createdAt: true,
        approved: true,
        approvedAt: true,
        applicationStatus: true,
        unit: { select: { unitName: true } },
      },
    }),
  ]);

  if (!user) redirect("/event/login");

  const now = new Date();
  const patsYear =
    data.deadlines.find((d) => d.key === "payment")?.date.getUTCFullYear() ??
    now.getUTCFullYear();
  const unitName = user.unit?.unitName ?? "your unit";

  const raw: { date: Date; title: string; description: string }[] = [
    {
      date: user.createdAt,
      title: "Registration opened",
      description: `You registered ${unitName} for PATS ${patsYear}`,
    },
  ];
  if (
    (user.approved || user.applicationStatus === APPLICATION_STATUS.APPROVED) &&
    user.approvedAt
  ) {
    raw.push({
      date: user.approvedAt,
      title: "Application approved",
      description: "Cleared by PATS for the next stage",
    });
  }
  for (const d of data.deadlines) {
    raw.push({
      date: d.date,
      title: d.label,
      description:
        d.key === "registration"
          ? "Final date to register a unit"
          : "Complete payment to confirm your place",
    });
  }
  for (const k of data.keyDates) {
    if (!k.date) continue;
    const dt = k.date instanceof Date ? k.date : new Date(k.date);
    if (!Number.isNaN(dt.getTime())) {
      raw.push({ date: dt, title: k.label, description: k.value });
    }
  }

  raw.sort((a, b) => a.date.getTime() - b.date.getTime());

  let upcomingAssigned = false;
  const events: PortalTimelineEvent[] = raw.map((r, i) => {
    let status: PortalTimelineStatus;
    if (r.date.getTime() <= now.getTime()) {
      status = "completed";
    } else if (!upcomingAssigned) {
      status = "upcoming";
      upcomingAssigned = true;
    } else {
      status = "scheduled";
    }
    return { id: String(i), date: r.date, title: r.title, description: r.description, status };
  });

  return (
    <>
      <Link href="/event/dashboard" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PatsPortalHeader
          title="Timeline &amp; deadlines"
          subtitle="Key dates and deadlines for PATS. Deadlines are enforced — submit before each date to keep your place."
        />
      </div>

      <div className="portal-form-card">
        <PortalTimeline events={events} />
      </div>
    </>
  );
}
