import { APPLICATION_STATUS } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/constants";

export function isApplicationApproved(status: string): boolean {
  return status === APPLICATION_STATUS.APPROVED;
}

export function applicationStatusSummary(applicationStatus: string): string {
  if (applicationStatus === APPLICATION_STATUS.REJECTED) {
    return "Your registration was rejected by the Sports Directorate. See the reason provided.";
  }
  if (applicationStatus === APPLICATION_STATUS.RETURNED) {
    return "Your registration was returned for correction. Update your details and await re-verification.";
  }
  if (applicationStatus === APPLICATION_STATUS.UNDER_REVIEW) {
    return "Your registration is under review by the Sports Directorate (SD).";
  }
  if (applicationStatus === APPLICATION_STATUS.PENDING) {
    return "Complete every registration step; the Sports Directorate (SD) approves your registration once all steps are done.";
  }
  return "Your registration is approved by the Sports Directorate.";
}

export function normalizeApplicationStatus(
  value: string
): ApplicationStatus {
  if (
    value === APPLICATION_STATUS.APPROVED ||
    value === APPLICATION_STATUS.REJECTED ||
    value === APPLICATION_STATUS.UNDER_REVIEW ||
    value === APPLICATION_STATUS.RETURNED
  ) {
    return value;
  }
  return APPLICATION_STATUS.PENDING;
}
