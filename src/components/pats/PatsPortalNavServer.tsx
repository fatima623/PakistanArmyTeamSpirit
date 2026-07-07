import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/cached-auth";
import { isApplicationApproved } from "@/lib/user-status";
import {
  canViewHostInfo,
  currentWorkflowStageIndex,
  deriveWorkflowStages,
  isRosterComplete,
  workflowUserSelect,
} from "@/lib/participant-workflow";
import { getWorkflowSettings } from "@/lib/workflow-settings";

import { PatsPortalNav } from "./PatsPortalNav";

export async function PatsPortalNavServer() {
  const session = await getCachedSession();
  let showPaymentLink = false;
  let showFlightsLink = false;
  let showHostInfoLink = false;
  let stageLabel: string | undefined;
  let stageStep: { current: number; total: number } | undefined;
  let stageTone: "pending" | "confirmed" = "pending";

  if (session?.user?.id) {
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          ...workflowUserSelect,
          _count: { select: { teamMembers: true } },
        },
      }),
      getWorkflowSettings(),
    ]);
    if (user) {
      showPaymentLink =
        !user.suspended && isApplicationApproved(user.applicationStatus);
      showFlightsLink = isRosterComplete(user);
      showHostInfoLink = canViewHostInfo(user, settings);

      const stages = deriveWorkflowStages({
        user,
        settings,
        teamMemberCount: user._count.teamMembers,
      });
      const idx = currentWorkflowStageIndex(stages);
      if (idx >= 0) {
        stageLabel = stages[idx].label;
        stageStep = { current: idx + 1, total: stages.length };
        stageTone = "pending";
      } else {
        stageLabel = "Journey complete";
        stageStep = { current: stages.length, total: stages.length };
        stageTone = "confirmed";
      }
    }
  }

  return (
    <PatsPortalNav
      showPaymentLink={showPaymentLink}
      showFlightsLink={showFlightsLink}
      showHostInfoLink={showHostInfoLink}
      stageLabel={stageLabel}
      stageStep={stageStep}
      stageTone={stageTone}
    />
  );
}
