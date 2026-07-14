import {
  AccountSuspendedError,
  AccountLockedError,
  RegistrationRejectedError,
} from "@/lib/auth-login-errors";
import { APPLICATION_STATUS } from "@/lib/constants";
import { isHostRole, isStaffRole } from "@/lib/auth-routes";
import { normalizeApplicationStatus } from "@/lib/user-status";

type LoginUser = {
  role: string;
  approved: boolean;
  applicationStatus: string;
  suspended: boolean;
  emailVerifiedAt?: Date | null;
  lockedUntil?: Date | null;
};

/** Blocks login for suspended, locked, or rejected accounts only. */
export function assertParticipantMayLogin(user: LoginUser): void {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AccountLockedError();
  }

  if (user.suspended) {
    throw new AccountSuspendedError();
  }

  // Staff and Host Formation logins skip the participant approval gate.
  if (isStaffRole(user.role) || isHostRole(user.role)) {
    return;
  }

  const status =
    user.approved &&
    normalizeApplicationStatus(user.applicationStatus) ===
      APPLICATION_STATUS.PENDING
      ? APPLICATION_STATUS.APPROVED
      : normalizeApplicationStatus(user.applicationStatus);

  if (status === APPLICATION_STATUS.REJECTED) {
    throw new RegistrationRejectedError();
  }
}
