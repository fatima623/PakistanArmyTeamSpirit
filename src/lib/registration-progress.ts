import {
  currentWorkflowStageIndex,
  deriveWorkflowStages,
  isRegistrationApproved,
  type WorkflowSettings,
  type WorkflowUser,
} from "@/lib/participant-workflow";

/**
 * Staff-facing view of how far a participant has got. Both the SD (who decides)
 * and the Admin (who oversees) read the same derivation the participant sees on
 * their dashboard, so the three surfaces can never disagree about which step a
 * team is on.
 *
 * Host information is dropped: it is a post-approval courtesy page, not a step
 * anyone is waiting on.
 */
export type RegistrationProgress = {
  /** Steps completed, out of `total`. */
  done: number;
  total: number;
  /** Label of the step the participant is on ("Approved" once finished). */
  currentLabel: string;
  /** 1-based position of the current step, or `total` when everything is done. */
  currentStep: number;
  /** Every participant-side step is filled in and the SD can decide. */
  readyForApproval: boolean;
  approved: boolean;
};

export function getRegistrationProgress(
  user: WorkflowUser,
  settings: WorkflowSettings,
  teamMemberCount: number
): RegistrationProgress {
  const stages = deriveWorkflowStages({
    user,
    settings,
    teamMemberCount,
  }).filter((s) => s.key !== "hostInfo");

  const done = stages.filter((s) => s.state === "done").length;
  const idx = currentWorkflowStageIndex(stages);
  const approved = isRegistrationApproved(user);

  return {
    done,
    total: stages.length,
    currentLabel: idx >= 0 ? stages[idx].label : "Approved",
    currentStep: idx >= 0 ? idx + 1 : stages.length,
    readyForApproval: idx >= 0 && stages[idx].key === "verification",
    approved,
  };
}

/** Columns the progress derivation needs, for a `select` on a list query. */
export const registrationProgressSelect = {
  applicationStatus: true,
  approved: true,
  suspended: true,
  participationConfirmedAt: true,
  unitInfoCompletedAt: true,
  teamRegisteredAt: true,
  rosterCompletedAt: true,
  flightsSubmittedAt: true,
  submittedForApprovalAt: true,
  maxTeamMembersOverride: true,
  flightsFinalizedAt: true,
} as const;
