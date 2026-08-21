import { APPLICATION_STATUS, type ApplicationStatus } from "@/lib/constants";

/**
 * The SD's decision on a finished registration, expressed as the exact column
 * set to write. Keeping it in one place is what stops `approved`, `approvedAt`,
 * `rejectedAt` and `rejectionReason` drifting out of step with
 * `applicationStatus` across the routes that can change it.
 */
export function buildApplicationUpdateData(
  applicationStatus: ApplicationStatus,
  rejectionReason?: string | null
) {
  const now = new Date();
  if (applicationStatus === APPLICATION_STATUS.APPROVED) {
    return {
      applicationStatus,
      approved: true,
      approvedAt: now,
      rejectedAt: null,
      rejectionReason: null,
    };
  }
  if (applicationStatus === APPLICATION_STATUS.REJECTED) {
    return {
      applicationStatus,
      approved: false,
      approvedAt: null,
      rejectedAt: now,
      rejectionReason: rejectionReason ?? null,
    };
  }
  if (applicationStatus === APPLICATION_STATUS.RETURNED) {
    // Returned for correction: not a terminal rejection — keep the reason so
    // the participant knows what to fix, but do not stamp rejectedAt.
    return {
      applicationStatus,
      approved: false,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: rejectionReason ?? null,
    };
  }
  return {
    applicationStatus,
    approved: false,
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
  };
}
