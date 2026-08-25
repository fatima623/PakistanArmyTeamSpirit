import { APPLICATION_STATUS } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/constants";

export function isApplicationApproved(status: string): boolean {
  return status === APPLICATION_STATUS.APPROVED;
}

export function applicationStatusSummary(applicationStatus: string): string {
  if (applicationStatus === APPLICATION_STATUS.REJECTED) {
    return "Your registration was rejected by PATS. See the reason provided.";
  }
  if (applicationStatus === APPLICATION_STATUS.RETURNED) {
    return "Your registration was returned for correction. Update your details and await re-verification.";
  }
  if (applicationStatus === APPLICATION_STATUS.UNDER_REVIEW) {
    return "Your registration is under review by PATS.";
  }
  if (applicationStatus === APPLICATION_STATUS.PENDING) {
    return "Complete every registration step; PATS approves your registration once all steps are done.";
  }
  return "Your registration is approved by PATS.";
}

/** The statuses that record a decision the SD Directorate has already taken.
 *  Everything else — PENDING, UNDER_REVIEW, and any legacy or blank value —
 *  is still awaiting that decision. */
export const DECIDED_APPLICATION_STATUSES: ApplicationStatus[] = [
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.REJECTED,
  APPLICATION_STATUS.RETURNED,
];

/** Prisma filter for the "Pending" bucket — every registration the SD
 *  Directorate has not decided on yet. It is deliberately the exact inverse of
 *  `normalizeApplicationStatus`, so a chip count can never disagree with the
 *  list it labels: matching the literal "PENDING" string dropped every team
 *  that had submitted for approval (UNDER_REVIEW), which is why the chip read
 *  "Pending (1)" above a table that said "No users found". */
export function pendingApplicationStatusFilter(): { notIn: string[] } {
  return { notIn: [...DECIDED_APPLICATION_STATUSES] };
}

export function normalizeApplicationStatus(
  value: string
): ApplicationStatus {
  if (
    value === APPLICATION_STATUS.APPROVED ||
    value === APPLICATION_STATUS.REJECTED ||
    value === APPLICATION_STATUS.RETURNED
  ) {
    return value;
  }
  return APPLICATION_STATUS.PENDING;
}
