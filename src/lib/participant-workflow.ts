import {
  APPLICATION_STATUS,
  DEFAULT_MAX_TEAM_MEMBERS,
  PAYMENT_STATUS,
  isPaymentVerified,
  normalizePaymentStatus,
} from "@/lib/constants";
import { normalizeApplicationStatus } from "@/lib/user-status";
import { enWorkflow, type WorkflowStrings } from "@/lib/i18n/workflow-strings";

/**
 * Client-safe participant workflow engine.
 *
 * The guided journey is strictly sequential — each stage unlocks only after
 * the previous one completes:
 *
 *   1. confirmation      — first-login participation confirmation (deadline)
 *   2. verification      — registration verification by SD (Sports Directorate)
 *   3. payment           — fee submission, verified by MT (Management Team)
 *   4. teamRegistration  — team registration inside the admin-configured window
 *   5. roster            — team member table (capped, extendable on request)
 *   6. flights           — flight details + passport/ticket PDFs
 *   7. hostInfo          — read-only hosting dashboard once flights finalized
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
  paymentStatus: string;
  approved: boolean;
  suspended: boolean;
  participationConfirmedAt: Date | null;
  teamRegisteredAt: Date | null;
  rosterCompletedAt: Date | null;
  maxTeamMembersOverride: number | null;
  flightsFinalizedAt: Date | null;
};

export const WORKFLOW_STAGES = [
  "confirmation",
  "verification",
  "payment",
  "teamRegistration",
  "roster",
  "flights",
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

export function isRegistrationApproved(user: WorkflowUser): boolean {
  return (
    normalizeApplicationStatus(user.applicationStatus) ===
      APPLICATION_STATUS.APPROVED || user.approved
  );
}

export function isPaymentComplete(user: WorkflowUser): boolean {
  return isPaymentVerified(user.paymentStatus);
}

export function hasRegisteredTeam(user: WorkflowUser): boolean {
  return !!user.teamRegisteredAt;
}

export function isRosterComplete(user: WorkflowUser): boolean {
  return !!user.rosterCompletedAt;
}

export function areFlightsFinalized(user: WorkflowUser): boolean {
  return !!user.flightsFinalizedAt;
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

export function canRegisterTeam(
  user: WorkflowUser,
  settings: WorkflowSettings,
  now: Date = new Date()
): boolean {
  return (
    !user.suspended &&
    hasConfirmedParticipation(user) &&
    isRegistrationApproved(user) &&
    isPaymentComplete(user) &&
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
  const appStatus = normalizeApplicationStatus(user.applicationStatus);
  const approvedStage = isRegistrationApproved(user);
  const payStatus = normalizePaymentStatus(user.paymentStatus);
  const paid = isPaymentComplete(user);
  const windowState = getTeamRegistrationWindowState(settings, now);
  const teamRegistered = hasRegisteredTeam(user);
  const rosterDone = isRosterComplete(user);
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

  // 2 — Registration verification (SD)
  const verificationLocked = !confirmed;
  stages.push({
    key: "verification",
    label: L.verification,
    state: verificationLocked
      ? "locked"
      : approvedStage
        ? "done"
        : appStatus === APPLICATION_STATUS.REJECTED ||
            appStatus === APPLICATION_STATUS.RETURNED
          ? "attention"
          : "current",
    sub: verificationLocked
      ? S.locked
      : approvedStage
        ? S.approvedBySd
        : appStatus === APPLICATION_STATUS.REJECTED
          ? S.rejected
          : appStatus === APPLICATION_STATUS.RETURNED
            ? S.returnedForCorrection
            : appStatus === APPLICATION_STATUS.UNDER_REVIEW
              ? S.underReviewBySd
              : S.pendingSdVerification,
    href: verificationLocked ? null : "/event/dashboard",
  });

  // 3 — Payment (MT verifies)
  const paymentLocked = verificationLocked || !approvedStage;
  stages.push({
    key: "payment",
    label: L.payment,
    state: paymentLocked
      ? "locked"
      : paid
        ? "done"
        : payStatus === PAYMENT_STATUS.REJECTED ||
            payStatus === PAYMENT_STATUS.RETURNED
          ? "attention"
          : "current",
    sub: paymentLocked
      ? S.locked
      : paid
        ? S.verifiedByMt
        : payStatus === PAYMENT_STATUS.SUBMITTED ||
            payStatus === PAYMENT_STATUS.UNDER_REVIEW
          ? S.underReviewByMt
          : payStatus === PAYMENT_STATUS.REJECTED
            ? S.proofRejected
            : payStatus === PAYMENT_STATUS.RETURNED
              ? S.returnedForCorrection
              : S.paymentRequired,
    href: paymentLocked ? null : "/event/payment",
  });

  // 4 — Team registration (window-gated)
  const teamRegLocked = paymentLocked || !paid;
  stages.push({
    key: "teamRegistration",
    label: L.teamRegistration,
    state: teamRegLocked
      ? "locked"
      : teamRegistered
        ? "done"
        : windowState === "open"
          ? "current"
          : "attention",
    sub: teamRegLocked
      ? S.locked
      : teamRegistered
        ? S.teamRegistered
        : windowState === "before"
          ? settings.teamRegistrationOpenDate
            ? S.opensOn(fmt(settings.teamRegistrationOpenDate))
            : S.notYetOpen
          : windowState === "closed"
            ? S.windowClosed
            : settings.teamRegistrationCloseDate
              ? S.openUntil(fmt(settings.teamRegistrationCloseDate))
              : S.windowOpen,
    href: teamRegLocked ? null : "/event/team",
  });

  // 5 — Team members roster
  const rosterLocked = teamRegLocked || !teamRegistered;
  stages.push({
    key: "roster",
    label: L.roster,
    state: rosterLocked ? "locked" : rosterDone ? "done" : "current",
    sub: rosterLocked
      ? S.locked
      : rosterDone
        ? S.membersConfirmed(teamMemberCount)
        : S.membersAdded(teamMemberCount, limit),
    href: rosterLocked ? null : "/event/team",
  });

  // 6 — Flight details
  const flightsLocked = rosterLocked || !rosterDone;
  const flightDeadlinePassed = isFlightDeadlinePassed(settings, now);
  stages.push({
    key: "flights",
    label: L.flights,
    state: flightsLocked
      ? "locked"
      : flightsDone
        ? "done"
        : flightDeadlinePassed
          ? "attention"
          : "current",
    sub: flightsLocked
      ? S.locked
      : flightsDone
        ? S.finalized
        : flightDeadlinePassed
          ? S.deadlinePassedLocked
          : settings.flightDetailsDeadline
            ? S.submitBy(fmt(settings.flightDetailsDeadline))
            : S.provideTravelDocs,
    href: flightsLocked ? null : "/event/flights",
  });

  // 7 — Host information
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
  paymentStatus: true,
  approved: true,
  suspended: true,
  participationConfirmedAt: true,
  teamRegisteredAt: true,
  rosterCompletedAt: true,
  maxTeamMembersOverride: true,
  flightsFinalizedAt: true,
} as const;
