import { APPLICATION_STATUS, isPaymentVerified } from "@/lib/constants";
import { normalizeApplicationStatus } from "@/lib/user-status";

/** Participant portal dashboard stages (application + payment lifecycle). */
export type ParticipantJourneyStage = 1 | 2 | 3;

export function resolveParticipantJourneyStage(params: {
  applicationStatus: string;
  paymentStatus: string;
  approved: boolean;
}): ParticipantJourneyStage {
  if (isPaymentVerified(params.paymentStatus)) {
    return 3;
  }

  const appStatus = normalizeApplicationStatus(params.applicationStatus);
  if (appStatus === APPLICATION_STATUS.APPROVED || params.approved) {
    return 2;
  }

  return 1;
}

export function isParticipantApplicationApproved(params: {
  applicationStatus: string;
  approved: boolean;
}): boolean {
  return (
    normalizeApplicationStatus(params.applicationStatus) ===
      APPLICATION_STATUS.APPROVED || params.approved
  );
}
