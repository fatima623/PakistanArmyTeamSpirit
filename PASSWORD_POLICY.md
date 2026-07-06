# Password policy — PATS

This document describes password security **as implemented in this codebase** and recommended production hardening.

---

## Current implementation (after audit)

### When passwords are validated

| Flow | Schema / check | Complexity rules |
|------|----------------|------------------|
| **Registration** | `RegisterSchema` → `passwordFieldSchema` | Yes (see below) |
| **Forgot password → set new** | `PasswordResetConfirmSchema` | Yes |
| **Admin reset user password** | `AdminResetPasswordSchema` | Yes |
| **Login** | `LoginSchema` | **No** — only requires non-empty password |

Login intentionally **does not** enforce complexity so accounts created under the old “8 characters only” rule can still sign in until they change their password via reset or admin action.

### Password rules (new passwords only)

Defined in `src/lib/password-policy.ts`:

| Rule | Value |
|------|--------|
| Minimum length | **8** characters |
| Maximum length | **128** characters |
| Uppercase | At least one `A–Z` |
| Lowercase | At least one `a–z` |
| Number | At least one `0–9` |
| Special character | At least one non-alphanumeric |

Human-readable summary: `PASSWORD_POLICY_SUMMARY` in `password-policy.ts`.

### Hashing

| Item | Implementation |
|------|----------------|
| Library | **`bcryptjs`** (JavaScript implementation, compatible with bcrypt hashes) |
| Algorithm | bcrypt |
| Cost factor (salt rounds) | **`10`** (`BCRYPT_ROUNDS` in `password-policy.ts`) |
| Per-password salt | **Automatic** — bcrypt generates a unique salt per hash and stores it inside the `passwordHash` string (no separate salt column) |
| Storage | `User.passwordHash` (VARCHAR), never plaintext |

Used in:

- `src/app/api/register/route.ts`
- `src/app/api/password-reset/confirm/route.ts`
- `src/app/api/admin/users/[id]/route.ts` (admin password reset)
- `prisma/seed.ts`

### Login verification

- `src/lib/auth.ts` — NextAuth Credentials provider
- `bcrypt.compare(plainPassword, user.passwordHash)` — constant-time comparison provided by bcrypt
- Invalid email or password returns `null` (generic failure; no user enumeration on login)

### Password reset token security

| Item | Implementation |
|------|----------------|
| Token generation | `crypto.randomBytes(32)` → 64 hex characters (**256 bits** entropy) |
| Storage | Plaintext in `PasswordReset.token` (unique index) |
| Expiry | **1 hour** (`expiresAt = now + 60 * 60 * 1000`) |
| Single use | `used` flag set `true` after successful reset |
| Invalid token response | HTTP **410** with generic message |
| Email enumeration | Request endpoint always returns `{ success: true }` whether or not the email exists |
| Delivery | Email via `sendMail` (`src/lib/mail.ts`); dev fallback logs token to console if SMTP not configured |

**Not implemented (recommended for hardening):**

- Hashing reset tokens at rest (compare SHA-256 of token instead of storing raw token)
- Invalidating older tokens when a new reset is requested
- Rate limiting on `/api/password-reset`

---

## Previous policy (before complexity upgrade)

Historically the app only required:

- **Minimum 8 characters**
- No uppercase / lowercase / number / special requirements

That met a minimal bar but not typical MOD/enterprise password guidance.

---

## Recommended production-grade policy

| Area | Recommendation | Status in app |
|------|----------------|---------------|
| Length | 8–128 characters | Implemented |
| Complexity | Upper + lower + number + special | **Implemented** (new passwords only) |
| bcrypt cost | 10–12 rounds; increase over time as hardware allows | **10** (OK; consider 12 later) |
| Login | Do not re-validate complexity | Implemented |
| Reset token | 256-bit random, 1h TTL, single-use | Implemented |
| Reset token at rest | Store SHA-256 hash of token | Not implemented |
| Rate limits | Login + password-reset endpoints | Not implemented |
| Password history | Prevent reuse of last N passwords | Not implemented |
| Breach check | Optional Have I Been Pwned k-anonymity API | Not implemented |

### Seed / test credentials

Seeded passwords (`Admin123!`, `TestPass123!`) satisfy the new policy.

---

## Files reference

| File | Purpose |
|------|---------|
| `src/lib/password-policy.ts` | Rules, Zod schema, `BCRYPT_ROUNDS`, client `validateNewPassword()` |
| `src/lib/validations.ts` | Wires schema into register / reset / admin APIs |
| `src/lib/auth.ts` | Login + `bcrypt.compare` |
| `src/app/api/password-reset/route.ts` | Issue reset token |
| `src/app/api/password-reset/confirm/route.ts` | Set new password |
| `prisma/schema.prisma` | `PasswordReset` model |

---

## Operator notes

1. **Existing weak passwords** — Users can still log in; ask them to use “Forgot password” to upgrade to a compliant password.
2. **Increasing `BCRYPT_ROUNDS`** — Only affects newly hashed passwords unless you force a reset; existing hashes remain valid at old cost.
3. **SMTP** — Reset emails require SMTP env vars in production (see `WORKFLOW.md`).
