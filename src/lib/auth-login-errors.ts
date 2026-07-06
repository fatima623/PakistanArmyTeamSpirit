import { CredentialsSignin } from "next-auth";

/** Stable codes returned to the login form (via signIn `error`). */
export const LOGIN_ERROR_CODE = {
  INVALID_CREDENTIALS: "invalid_credentials",
  EMAIL_NOT_VERIFIED: "email_not_verified",
  PENDING_APPROVAL: "pending_approval",
  REGISTRATION_REJECTED: "registration_rejected",
  ACCOUNT_SUSPENDED: "account_suspended",
  ACCOUNT_LOCKED: "account_locked",
} as const;

export type LoginErrorCode =
  (typeof LOGIN_ERROR_CODE)[keyof typeof LOGIN_ERROR_CODE];

const USER_MESSAGES: Record<LoginErrorCode, string> = {
  [LOGIN_ERROR_CODE.INVALID_CREDENTIALS]:
    "Invalid email or password.",
  [LOGIN_ERROR_CODE.EMAIL_NOT_VERIFIED]:
    "Please verify your email address before logging in.",
  [LOGIN_ERROR_CODE.PENDING_APPROVAL]:
    "Your registration is pending approval from administrators.",
  [LOGIN_ERROR_CODE.REGISTRATION_REJECTED]:
    "Your registration was rejected. Please contact administration.",
  [LOGIN_ERROR_CODE.ACCOUNT_SUSPENDED]:
    "Your account has been suspended. Please contact administration.",
  [LOGIN_ERROR_CODE.ACCOUNT_LOCKED]:
    "Too many failed login attempts. Your account is locked for 15 minutes.",
};

const DEFAULT_MESSAGE =
  "Unable to sign in. Please check your details and try again.";

export class InvalidCredentialsError extends CredentialsSignin {
  code = LOGIN_ERROR_CODE.INVALID_CREDENTIALS;
}

export class PendingApprovalError extends CredentialsSignin {
  code = LOGIN_ERROR_CODE.PENDING_APPROVAL;
}

export class RegistrationRejectedError extends CredentialsSignin {
  code = LOGIN_ERROR_CODE.REGISTRATION_REJECTED;
}

export class AccountSuspendedError extends CredentialsSignin {
  code = LOGIN_ERROR_CODE.ACCOUNT_SUSPENDED;
}

export class EmailNotVerifiedError extends CredentialsSignin {
  code = LOGIN_ERROR_CODE.EMAIL_NOT_VERIFIED;
}

export class AccountLockedError extends CredentialsSignin {
  code = LOGIN_ERROR_CODE.ACCOUNT_LOCKED;
}

export function resolveLoginErrorMessage(
  error: string | undefined | null
): string {
  if (!error) {
    return DEFAULT_MESSAGE;
  }

  const normalized = error.trim().toLowerCase();

  if (normalized in USER_MESSAGES) {
    return USER_MESSAGES[normalized as LoginErrorCode];
  }

  if (normalized === "credentialssignin") {
    return DEFAULT_MESSAGE;
  }

  return DEFAULT_MESSAGE;
}
