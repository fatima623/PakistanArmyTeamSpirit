import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";
import { validateAuthCsrfToken } from "@/lib/auth-csrf";
import { checkRateLimit, getClientIp } from "@/lib/compliance/rate-limit";
import { hashOpaqueToken } from "@/lib/auth-token";
import { PasswordResetConfirmSchema } from "@/lib/validations";
import {
  handleApiError,
  requireJsonContentType,
} from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(
      getClientIp(request),
      "password-reset-confirm",
      10,
      60_000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please request a new reset link." },
        {
          status: 429,
          headers: rateLimit.retryAfterSec
            ? { "Retry-After": String(rateLimit.retryAfterSec) }
            : undefined,
        }
      );
    }

    requireJsonContentType(request);
    const body = await request.json();
    await validateAuthCsrfToken(
      typeof body?.csrfToken === "string" ? body.csrfToken : null
    );
    const parsed = PasswordResetConfirmSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;
    const tokenHash = hashOpaqueToken(token);
    const reset = await prisma.passwordReset.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !reset ||
      reset.usedAt ||
      reset.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 410 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.passwordReset.deleteMany({
        where: { userId: reset.userId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
