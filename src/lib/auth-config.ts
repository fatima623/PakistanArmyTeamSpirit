import type { NextAuthConfig } from "next-auth";
import {
  LONG_SESSION_MS,
  TOKEN_REFRESH_THRESHOLD_MS,
} from "@/lib/auth-security";

/**
 * Edge-safe half of the NextAuth config.
 *
 * The middleware runs on Vercel's Edge runtime, which caps the bundle at 1MB.
 * Importing the full `@/lib/auth` there dragged in Prisma Client, bcryptjs and
 * the zod validation schemas and blew past that limit, failing the build.
 *
 * So everything the middleware actually needs to READ a session — secret,
 * cookie names, jwt/session callbacks — lives here with no Node-only deps.
 * `providers` is deliberately empty: signing in needs the database, and that
 * only ever happens in the Node runtime via `@/lib/auth`.
 *
 * Keep `secret`, `session` and `cookies` identical across both instances or
 * the middleware will fail to decode cookies issued by the login route.
 */
export const authConfig = {
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
  providers: [],
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
} satisfies NextAuthConfig;
