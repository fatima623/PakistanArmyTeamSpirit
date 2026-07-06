import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { assertParticipantMayLogin } from "@/lib/auth-login";
import {
  AccountLockedError,
  InvalidCredentialsError,
} from "@/lib/auth-login-errors";
import {
  getSessionLifetimeMs,
  LOGIN_FAILED_ATTEMPT_LIMIT,
  LOGIN_LOCKOUT_MS,
  LONG_SESSION_MS,
  TOKEN_REFRESH_THRESHOLD_MS,
} from "@/lib/auth-security";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: Math.floor(LONG_SESSION_MS / 1000),
    updateAge: 60 * 60,
  },
  pages: {
    signIn: "/event/login",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.approved = user.approved;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isEmailVerified = Boolean(user.isEmailVerified);
        token.rememberMe = Boolean(user.rememberMe);
        token.sessionExpiresAt = user.sessionExpiresAt;
      } else if (token.rememberMe && token.sessionExpiresAt) {
        const expiresAt = new Date(token.sessionExpiresAt as string).getTime();
        const now = Date.now();
        if (expiresAt - now <= TOKEN_REFRESH_THRESHOLD_MS) {
          token.sessionExpiresAt = new Date(now + LONG_SESSION_MS).toISOString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.approved = token.approved as boolean;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isEmailVerified = Boolean(token.isEmailVerified);
      }
      session.sessionExpiresAt = token.sessionExpiresAt as string | undefined;
      return session;
    },
  },
});
