import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireParticipantSession } from "@/lib/require-participant";
import { getWorkflowSettings } from "@/lib/workflow-settings";
import { isConfirmationDeadlinePassed } from "@/lib/participant-workflow";
import { ParticipationConfirmCard } from "@/components/dashboard/ParticipationConfirmCard";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.confirmParticipation };
}

export default async function ConfirmParticipationPage() {
  const session = await requireParticipantSession();

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        participationConfirmedAt: true,
        participationDeclinedAt: true,
        unit: { select: { unitName: true } },
      },
    }),
    getWorkflowSettings(),
  ]);

  if (!user) {
    redirect("/event/login");
  }
  if (user.participationConfirmedAt) {
    redirect("/event/dashboard");
  }

  return (
    <ParticipationConfirmCard
      firstName={user.firstName}
      lastName={user.lastName}
      unitName={user.unit?.unitName ?? null}
      deadlineIso={
        settings.participationConfirmDeadline?.toISOString() ?? null
      }
      initialExpired={isConfirmationDeadlinePassed(settings)}
      previouslyDeclined={!!user.participationDeclinedAt}
    />
  );
}
