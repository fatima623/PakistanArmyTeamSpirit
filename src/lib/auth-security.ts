export const LOGIN_FAILED_ATTEMPT_LIMIT = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;
export const LOGIN_LOCKOUT_MS = LOGIN_LOCKOUT_MINUTES * 60 * 1000;
export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const SHORT_SESSION_MS = 24 * 60 * 60 * 1000;
export const LONG_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
export const TOKEN_REFRESH_THRESHOLD_MS = 6 * 60 * 60 * 1000;

export function makeExpiryDate(msFromNow: number) {
  return new Date(Date.now() + msFromNow);
}

export function getSessionLifetimeMs(rememberMe: boolean) {
  return rememberMe ? LONG_SESSION_MS : SHORT_SESSION_MS;
}
