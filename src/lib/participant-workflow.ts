import {
  APPLICATION_STATUS,
  DEFAULT_MAX_TEAM_MEMBERS,
} from "@/lib/constants";
import { normalizeApplicationStatus } from "@/lib/user-status";
import { enWorkflow, type WorkflowStrings } from "@/lib/i18n/workflow-strings";

/**
 * Client-safe participant workflow engine.
 *
 * Accounts are created by the administration with nothing but a login and a
 * password — every registration detail is captured by the participant, one
 * unlocked stage at a time:
 *
 *   1. confirmation — first-login participation confirmation (deadline)
 *   2. unitInfo     — unit + CO details, filled in by the participant
 *   3. roster       — team registration + member table (capped, extendable)
 *   4. flights      — flight details + passport/ticket PDFs, then submitted
 *   5. verification — SD (Sports Directorate) approves the finished registration
 *   6. hostInfo     — read-only hosting dashboard once flights are finalized
 *
 * SD verification is deliberately last: there is nothing to verify until the
 * participant has supplied their unit, their roster and their travel documents.
 */

export type WorkflowSettings = {
  participationConfirmDeadline: Date | null;
  teamRegistrationOpenDate: Date | null;
  teamRegistrationCloseDate: Date | null;
  flightDetailsDeadline: Date | null;
  maxTeamMembers: number;
  hostInfoPublished: boolean;
};

export const DEFAULT_WORKFLOW_SETTINGS: WorkflowSettings = {
  participationConfirmDeadline: null,
  teamRegistrationOpenDate: null,
  teamRegistrationCloseDate: null,
  flightDetailsDeadline: null,
  maxTeamMembers: DEFAULT_MAX_TEAM_MEMBERS,
  hostInfoPublished: false,
};

export type WorkflowUser = {
  applicationStatus: string;
  approved: boolean;
  suspended: boolean;
  participationConfirmedAt: Date | null;
  unitInfoCompletedAt: Date | null;
  teamRegisteredAt: Date | null;
  rosterCompletedAt: Date | null;
  flightsSubmittedAt: Date | null;
  submittedForApprovalAt: Date | null;
  maxTeamMembersOverride: number | null;
  flightsFinalizedAt: Date | null;
};

export const WORKFLOW_STAGES = [
  "confirmation",
  "unitInfo",
  "roster",
  "flights",
  "verification",
  "hostInfo",
] as const;

export type WorkflowStageKey = (typeof WORKFLOW_STAGES)[number];

export type WorkflowStageState = "done" | "current" | "attention" | "locked";

export type WorkflowStage = {
  key: WorkflowStageKey;
  label: string;
  sub: string;
  state: WorkflowStageState;
  href: string | null;
};

/* ------------------------------------------------------------------ */
/* Deadline / window helpers                                           */
/* ------------------------------------------------------------------ */

export function isConfirmationDeadlinePassed(
  settings: WorkflowSettings,
  now: Date = new Date()
): boolean {
  return (
    !!settings.participationConfirmDeadline &&
    now.getTime() > settings.participationConfirmDeadline.getTime()
  );
}

export type TeamWindowState = "open" | "before" | "closed";

/** Null bounds are treated as unbounded on that side. */
export function getTeamRegistrationWindowState(
  settings: WorkflowSettings,
  now: Date = new Date()
): TeamWindowState {
  const open = settings.teamRegistrationOpenDate;
  const close = settings.teamRegistrationCloseDate;
  if (open && now.getTime() < open.getTime()) return "before";
  if (close && now.getTime() > close.getTime()) return "closed";
  return "open";
}

export function isFlightDeadlinePassed(
  settings: WorkflowSettings,
  now: Date = new Date()
): boolean {
  return (
    !!settings.flightDetailsDeadline &&
    now.getTime() > settings.flightDetailsDeadline.getTime()
  );
}

/** Team-member cap: per-user approved override, else the global setting. */
export function effectiveTeamLimit(
  user: Pick<WorkflowUser, "maxTeamMembersOverride">,
  settings: Pick<WorkflowSettings, "maxTeamMembers">
): number {
  return user.maxTeamMembersOverride ?? settings.maxTeamMembers;
}

/* ------------------------------------------------------------------ */
/* Stage completion predicates                                         */
/* ------------------------------------------------------------------ */

export function hasConfirmedParticipation(user: WorkflowUser): boolean {
  return !!user.participationConfirmedAt;
}

export function hasCompletedUnitInfo(user: WorkflowUser): boolean {
  return !!user.unitInfoCompletedAt;
}

export function hasRegisteredTeam(user: WorkflowUser): boolean {
  return !!user.teamRegisteredAt;
}

export function isRosterComplete(user: WorkflowUser): boolean {
  return !!user.rosterCompletedAt;
}

export function areFlightsSubmitted(user: WorkflowUser): boolean {
  return !!user.flightsSubmittedAt;
}

export function areFlightsFinalized(user: WorkflowUser): boolean {
  return !!user.flightsFinalizedAt;
}

export function isRegistrationApproved(user: WorkflowUser): boolean {
  return (
    normalizeApplicationStatus(user.applicationStatus) ===
      APPLICATION_STATUS.APPROVED || user.approved
  );
}

/** Every participant-supplied step is filled in — the SD queue can pick it up. */
export function isReadyForApproval(user: WorkflowUser): boolean {
  return (
    hasConfirmedParticipation(user) &&
    hasCompletedUnitInfo(user) &&
    isRosterComplete(user) &&
    areFlightsSubmitted(user)
  );
}

/**
 * Where the registration stands as a whole (the dashboard status banner), as
 * opposed to which individual step is next.
 */
export type RegistrationOverallStage =
  | "inProgress"
  | "underReview"
  | "approved"
  | "returned";

export function resolveRegistrationOverallStage(
  user: WorkflowUser
): RegistrationOverallStage {
  if (isRegistrationApproved(user)) return "approved";
  const status = normalizeApplicationStatus(user.applicationStatus);
  if (
    status === APPLICATION_STATUS.RETURNED ||
    status === APPLICATION_STATUS.REJECTED
  ) {
    return "returned";
  }
  return isReadyForApproval(user) ? "underReview" : "inProgress";
}

/* ------------------------------------------------------------------ */
/* Action gates (mirror these in the API routes)                       */
/* ------------------------------------------------------------------ */

export function canConfirmParticipation(
  user: WorkflowUser,
  settings: WorkflowSettings,
  now: Date = new Date()
): boolean {
  return (
    !user.suspended &&
    !hasConfirmedParticipation(user) &&
    !isConfirmationDeadlinePassed(settings, now)
  );
}

/**
 * Unit information unlocks the moment participation is confirmed, and stays
 * editable until the registration is approved (or flights are finalized), so a
 * returned registration can be corrected.
 */
export function canEditUnitInfo(user: WorkflowUser): boolean {
  return (
    !user.suspended &&
    hasConfirmedParticipation(user) &&
    !areFlightsFinalized(user)
  );
}

export function canRegisterTeam(
  user: WorkflowUser,
  settings: WorkflowSettings,
  now: Date = new Date()
): boolean {
  return (
    !user.suspended &&
    hasConfirmedParticipation(user) &&
    hasCompletedUnitInfo(user) &&
    !hasRegisteredTeam(user) &&
    getTeamRegistrationWindowState(settings, now) === "open"
  );
}

/** Roster stays editable until the administration finalizes flight details. */
export function canEditRoster(user: WorkflowUser): boolean {
  return (
    !user.suspended && hasRegisteredTeam(user) && !areFlightsFinalized(user)
  );
}

export function canEditFlights(
  user: WorkflowUser,
  settings: WorkflowSettings,
  now: Date = new Date()
): boolean {
  return (
    !user.suspended &&
    hasCompletedUnitInfo(user) &&
    isRosterComplete(user) &&
    !areFlightsFinalized(user) &&
    !isFlightDeadlinePassed(settings, now)
  );
}

export function canViewHostInfo(
  user: WorkflowUser,
  settings: WorkflowSettings
): boolean {
  return areFlightsFinalized(user) && settings.hostInfoPublished;
}

/* ------------------------------------------------------------------ */
/* Stage derivation for the guided dashboard                           */
/* ------------------------------------------------------------------ */

export function deriveWorkflowStages(params: {
  user: WorkflowUser;
  settings: WorkflowSettings;
  teamMemberCount: number;
  now?: Date;
  /** Localized workflow strings; falls back to English. */
  wf?: WorkflowStrings;
}): WorkflowStage[] {
  const { user, settings, teamMemberCount } = params;
  const now = params.now ?? new Date();
  const wf = params.wf ?? enWorkflow;
  const L = wf.label;
  const S = wf.sub;
  const fmt = wf.formatDate;

  const confirmed = hasConfirmedParticipation(user);
  const confirmExpired = isConfirmationDeadlinePassed(settings, now);
  const unitDone = hasCompletedUnitInfo(user);
  const appStatus = normalizeApplicationStatus(user.applicationStatus);
  const approvedStage = isRegistrationApproved(user);
  const returned =
    appStatus === APPLICATION_STATUS.RETURNED ||
    appStatus === APPLICATION_STATUS.REJECTED;
  const windowState = getTeamRegistrationWindowState(settings, now);
  const teamRegistered = hasRegisteredTeam(user);
  const rosterDone = isRosterComplete(user);
  const flightsSubmitted = areFlightsSubmitted(user);
  const flightsDone = areFlightsFinalized(user);
  const limit = effectiveTeamLimit(user, settings);

  const stages: WorkflowStage[] = [];

  // 1 — Participation confirmation
  stages.push({
    key: "confirmation",
    label: L.confirmation,
    state: confirmed ? "done" : confirmExpired ? "attention" : "current",
    sub: confirmed
      ? S.confirmed
      : confirmExpired
        ? S.deadlineExpired
        : settings.participationConfirmDeadline
          ? S.confirmBy(fmt(settings.participationConfirmDeadline))
          : S.actionRequired,
    href: confirmed ? null : "/event/confirm-participation",
  });

  // 2 — Unit information (participant-entered)
  /* A step that is already complete never renders as locked — a registration
     carried over from the old flow can have its unit on file while the newer
     confirmation step is still outstanding, and showing that as "Locked" hid
     work the participant had actually done. */
  const unitLocked = !confirmed && !unitDone;
  stages.push({
    key: "unitInfo",
    label: L.unitInfo,
    state: unitDone ? "done" : unitLocked ? "locked" : "current",
    sub: unitDone
      ? S.unitRecorded
      : unitLocked
        ? S.locked
        : S.provideUnitDetails,
    href: unitLocked ? null : "/event/edit/unit",
  });

  // 3 — Team registration + members roster (one stage, window-gated)
  const rosterLocked = (unitLocked || !unitDone) && !rosterDone;
  /* Before the team is registered this stage reports the registration window,
     since that is what the participant is waiting on. */
  const awaitingRegistration = !rosterLocked && !teamRegistered;
  stages.push({
    key: "roster",
    label: L.roster,
    state: rosterDone
      ? "done"
      : rosterLocked
        ? "locked"
        : awaitingRegistration && windowState !== "open"
          ? "attention"
          : "current",
    sub: rosterDone
      ? S.membersConfirmed(teamMemberCount)
      : rosterLocked
        ? S.locked
        : awaitingRegistration
          ? windowState === "before"
            ? settings.teamRegistrationOpenDate
              ? S.opensOn(fmt(settings.teamRegistrationOpenDate))
              : S.notYetOpen
            : windowState === "closed"
              ? S.windowClosed
              : settings.teamRegistrationCloseDate
                ? S.openUntil(fmt(settings.teamRegistrationCloseDate))
                : S.windowOpen
          : S.membersAdded(teamMemberCount, limit),
    href: rosterLocked ? null : "/event/team",
  });

  // 4 — Flight details
  const flightsDoneStep = flightsDone || flightsSubmitted;
  const flightsLocked = (rosterLocked || !rosterDone) && !flightsDoneStep;
  const flightDeadlinePassed = isFlightDeadlinePassed(settings, now);
  stages.push({
    key: "flights",
    label: L.flights,
    state: flightsDoneStep
      ? "done"
      : flightsLocked
        ? "locked"
        : flightDeadlinePassed
          ? "attention"
          : "current",
    sub: flightsDone
      ? S.finalized
      : flightsSubmitted
        ? S.flightsSubmitted
        : flightsLocked
          ? S.locked
          : flightDeadlinePassed
            ? S.deadlinePassedLocked
            : settings.flightDetailsDeadline
              ? S.submitBy(fmt(settings.flightDetailsDeadline))
              : S.provideTravelDocs,
    href: flightsLocked ? null : "/event/flights",
  });

  // 5 — SD approval of the completed registration
  const verificationLocked = !flightsSubmitted && !approvedStage;
  stages.push({
    key: "verification",
    label: L.verification,
    state: approvedStage
      ? "done"
      : verificationLocked
        ? "locked"
        : returned
          ? "attention"
          : "current",
    sub: approvedStage
      ? S.approvedBySd
      : verificationLocked
        ? S.completeStepsFirst
        : appStatus === APPLICATION_STATUS.REJECTED
          ? S.rejected
          : appStatus === APPLICATION_STATUS.RETURNED
            ? S.returnedForCorrection
            : appStatus === APPLICATION_STATUS.UNDER_REVIEW
              ? S.underReviewBySd
              : S.pendingSdVerification,
    href: verificationLocked && !approvedStage ? null : "/event/dashboard",
  });

  // 6 — Host information
  const hostAvailable = flightsDone && settings.hostInfoPublished;
  stages.push({
    key: "hostInfo",
    label: L.hostInfo,
    state: hostAvailable ? "done" : "locked",
    sub: hostAvailable
      ? S.available
      : flightsDone
        ? S.awaitingPublication
        : S.locked,
    href: hostAvailable ? "/event/host-info" : null,
  });

  return stages;
}

/** Index of the stage the participant should act on next (‑1 if all done). */
export function currentWorkflowStageIndex(stages: WorkflowStage[]): number {
  const idx = stages.findIndex(
    (s) => s.state === "current" || s.state === "attention"
  );
  return idx;
}

/** Select shape needed on User to feed {@link deriveWorkflowStages}. */
export const workflowUserSelect = {
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
