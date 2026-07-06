import { NextResponse } from "next/server";

import { checkRateLimit, getClientIp } from "@/lib/compliance/rate-limit";
import { prisma } from "@/lib/prisma";
import { hashOpaqueToken } from "@/lib/auth-token";

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(
    getClientIp(request),
    "password-reset-validate",
    30,
    60_000
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { valid: false, error: "Too many validation attempts." },
      {
        status: 429,
        headers: rateLimit.retryAfterSec
          ? { "Retry-After": String(rateLimit.retryAfterSec) }
          : undefined,
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Reset token is missing." },
      { status: 400 }
    );
  }

  const reset = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashOpaqueToken(token) },
    select: { id: true, expiresAt: true, usedAt: true },
  });

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return NextResponse.json(
      {
        valid: false,
        error: "This password reset link is invalid or has expired.",
      },
      { status: 410 }
    );
  }

  return NextResponse.json({ valid: true });
}
