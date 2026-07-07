import { prisma } from "@/lib/prisma";
import {
  DEFAULT_WORKFLOW_SETTINGS,
  type WorkflowSettings,
} from "@/lib/participant-workflow";

/**
 * Fresh (uncached) read of the workflow-critical settings. Deadlines and
 * windows gate server-side actions, so they must never be served stale.
 */
export async function getWorkflowSettings(): Promise<WorkflowSettings> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: {
        participationConfirmDeadline: true,
        teamRegistrationOpenDate: true,
        teamRegistrationCloseDate: true,
        flightDetailsDeadline: true,
        maxTeamMembers: true,
        hostInfoPublished: true,
      },
    });
    if (!row) return { ...DEFAULT_WORKFLOW_SETTINGS };
    return {
      participationConfirmDeadline: row.participationConfirmDeadline,
      teamRegistrationOpenDate: row.teamRegistrationOpenDate,
      teamRegistrationCloseDate: row.teamRegistrationCloseDate,
      flightDetailsDeadline: row.flightDetailsDeadline,
      maxTeamMembers: row.maxTeamMembers,
      hostInfoPublished: row.hostInfoPublished,
    };
  } catch (error) {
    console.error("[workflow-settings] read failed:", error);
    return { ...DEFAULT_WORKFLOW_SETTINGS };
  }
}
