import { z } from "zod";

/** bcrypt cost factor (salt rounds). Embedded per-hash by bcrypt; not stored separately. */
/** ISO / OWASP — minimum 12 rounds for password hashing */
export const BCRYPT_ROUNDS = 12;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_POLICY_SUMMARY =
  "At least 8 characters, including uppercase, lowercase, a number, and a special character.";

const hasLowercase = (v: string) => /[a-z]/.test(v);
const hasUppercase = (v: string) => /[A-Z]/.test(v);
const hasDigit = (v: string) => /[0-9]/.test(v);
const hasSpecial = (v: string) => /[^A-Za-z0-9]/.test(v);

/**
 * Validates passwords when they are SET (register, reset, admin reset).
 * Login uses a separate schema so existing accounts are not locked out.
 */
export const passwordFieldSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Minimum ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Maximum ${PASSWORD_MAX_LENGTH} characters`)
  .refine(hasLowercase, "Must include a lowercase letter")
  .refine(hasUppercase, "Must include an uppercase letter")
  .refine(hasDigit, "Must include a number")
  .refine(hasSpecial, "Must include a special character");

/** Client-side helper (matches server rules for immediate feedback). */
export function validateNewPassword(password: string): string | null {
  const result = passwordFieldSchema.safeParse(password);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "Password does not meet requirements";
}
