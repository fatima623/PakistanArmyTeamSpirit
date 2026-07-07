import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-helpers";
import {
  canEditRoster,
  effectiveTeamLimit,
  workflowUserSelect,
  type WorkflowSettings,
  type WorkflowUser,
} from "@/lib/participant-workflow";
import { getWorkflowSettings } from "@/lib/workflow-settings";

export type RosterContext = {
  user: WorkflowUser;
  settings: WorkflowSettings;
  limit: number;
  memberCount: number;
};

/** Loads workflow state for the caller (throws 404 if the user vanished). */
export async function loadRosterContext(userId: string): Promise<RosterContext> {
  const [user, settings, memberCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: workflowUserSelect,
    }),
    getWorkflowSettings(),
    prisma.teamMember.count({ where: { userId } }),
  ]);
  if (!user) throw new ApiError("User not found", 404);
  return {
    user,
    settings,
    limit: effectiveTeamLimit(user, settings),
    memberCount,
  };
}

/**
 * Guard for roster mutations: team must be registered and records must not
 * be locked by administration (flight finalization).
 */
export async function requireEditableRoster(
  userId: string
): Promise<RosterContext> {
  const ctx = await loadRosterContext(userId);
  if (!ctx.user.teamRegisteredAt) {
    throw new ApiError(
      "Register your team first — the roster unlocks after team registration",
      409
    );
  }
  if (!canEditRoster(ctx.user)) {
    throw new ApiError(
      "The roster is locked — records have been finalized by the administration",
      409
    );
  }
  return ctx;
}
