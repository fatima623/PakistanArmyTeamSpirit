import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

/**
 * Session reader for the Edge runtime (middleware only).
 *
 * Import this — never `@/lib/auth` — from `src/middleware.ts`. It carries no
 * Prisma/bcrypt/zod weight, which is what keeps the middleware bundle under
 * Vercel's 1MB Edge function limit. Anything running in the Node runtime
 * (route handlers, server actions, RSC) should keep using `@/lib/auth`.
 */
export const { auth } = NextAuth(authConfig);
