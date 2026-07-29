import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth-config";
import { assertParticipantMayLogin } from "@/lib/auth-login";
import {
  AccountLockedError,
  InvalidCredentialsError,
} from "@/lib/auth-login-errors";
import {
  getSessionLifetimeMs,
  LOGIN_FAILED_ATTEMPT_LIMIT,
  LOGIN_LOCKOUT_MS,
} from "@/lib/auth-security";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations";

/**
 * Full Node-runtime auth. Session/cookie/callback settings come from
 * `authConfig` so the Edge middleware instance in `@/lib/auth-edge` decodes
 * exactly the cookies this one issues — only the database-backed Credentials
 * provider is added on top. Never import this from `src/middleware.ts`.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new InvalidCredentialsError();
        }

        const email = parsed.data.email.toLowerCase().trim();
        const rememberMe = parsed.data.rememberMe;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.warn(`[auth] login failed: no user for email "${email}"`);
          throw new InvalidCredentialsError();
        }

        const now = new Date();
        const activeLock = user.lockedUntil && user.lockedUntil > now;
        if (activeLock) {
          throw new AccountLockedError();
        }
        if (!activeLock && (user.failedLoginAttempts > 0 || user.lockedUntil)) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
          });
          user.failedLoginAttempts = 0;
          user.lockedUntil = null;
        }

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) {
          console.warn(
            `[auth] login failed: password mismatch for "${email}" (hash matches a different password than the one entered)`
          );
          const nextFailedAttempts = user.failedLoginAttempts + 1;
          const shouldLock = nextFailedAttempts >= LOGIN_FAILED_ATTEMPT_LIMIT;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: shouldLock ? 0 : nextFailedAttempts,
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOGIN_LOCKOUT_MS)
                : user.lockedUntil && user.lockedUntil > now
                  ? user.lockedUntil
                  : null,
            },
          });
          if (shouldLock) {
            user.lockedUntil = new Date(Date.now() + LOGIN_LOCKOUT_MS);
            throw new AccountLockedError();
          }
          throw new InvalidCredentialsError();
        }

        try {
          assertParticipantMayLogin({
            role: user.role,
            approved: user.approved,
            applicationStatus: user.applicationStatus,
            suspended: user.suspended,
            emailVerifiedAt: user.emailVerifiedAt,
            lockedUntil: user.lockedUntil,
          });
        } catch (err) {
          console.warn(
            `[auth] login blocked for "${email}": ${(err as Error).name} ` +
              `(role=${user.role}, approved=${user.approved}, status=${user.applicationStatus}, suspended=${user.suspended})`
          );
          throw err;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });

        const sessionExpiresAt = new Date(
          Date.now() + getSessionLifetimeMs(rememberMe)
        ).toISOString();

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          approved: user.approved,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: Boolean(user.emailVerifiedAt),
          rememberMe,
          sessionExpiresAt,
        };
      },
    }),
  ],
});
