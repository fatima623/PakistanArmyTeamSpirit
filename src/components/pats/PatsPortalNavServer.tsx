import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/cached-auth";
import {
  currentWorkflowStageIndex,
  deriveWorkflowStages,
  workflowUserSelect,
} from "@/lib/participant-workflow";
import { getWorkflowSettings } from "@/lib/workflow-settings";
import { getDictionary } from "@/lib/i18n/get-dictionary";

import { PatsPortalNav } from "./PatsPortalNav";

export async function PatsPortalNavServer() {
  const session = await getCachedSession();
  const { t } = await getDictionary();
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
      /* `hostInfo` is filtered out for the same reason the dashboard's
         Registration progress panel drops it: it is a post-approval courtesy
         page, not a step the participant works through. Counting it here made
         the sidebar advertise "1/6" beside a panel showing five cards. */
      const stages = deriveWorkflowStages({
        user,
        settings,
        teamMemberCount: user._count.teamMembers,
        wf: t.workflow,
      }).filter((s) => s.key !== "hostInfo");
      const idx = currentWorkflowStageIndex(stages);
      if (idx >= 0) {
        stageLabel = stages[idx].label;
        stageStep = { current: idx + 1, total: stages.length };
        stageTone = "pending";
      } else {
        stageLabel = t.nav.journeyComplete;
        stageStep = { current: stages.length, total: stages.length };
        stageTone = "confirmed";
      }
    }
  }

  return (
    <PatsPortalNav
      stageLabel={stageLabel}
      stageStep={stageStep}
      stageTone={stageTone}
    />
  );
}
