import crypto from "crypto";
import { cookies } from "next/headers";

import { ApiError } from "@/lib/api-helpers";

const AUTH_CSRF_COOKIE = "pats-auth-csrf";

function cookieOptions() {
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  };
}

export async function getOrCreateAuthCsrfToken() {
  const store = await cookies();
  const existing = store.get(AUTH_CSRF_COOKIE)?.value;
  if (existing) return existing;

  const token = crypto.randomBytes(24).toString("hex");
  store.set(AUTH_CSRF_COOKIE, token, cookieOptions());
  return token;
}

export async function rotateAuthCsrfToken() {
  const store = await cookies();
  const token = crypto.randomBytes(24).toString("hex");
  store.set(AUTH_CSRF_COOKIE, token, cookieOptions());
  return token;
}

export async function validateAuthCsrfToken(submittedToken: string | null | undefined) {
  const store = await cookies();
  const cookieToken = store.get(AUTH_CSRF_COOKIE)?.value;
  if (!submittedToken || !cookieToken || submittedToken !== cookieToken) {
    throw new ApiError("Invalid CSRF token", 403);
  }
}
