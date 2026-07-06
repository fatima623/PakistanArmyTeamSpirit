import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAuthCsrfToken } from "@/lib/auth-csrf";
import { checkRateLimit, getClientIp } from "@/lib/compliance/rate-limit";
import {
  makeExpiryDate,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/auth-security";
import { generateOpaqueToken, hashOpaqueToken } from "@/lib/auth-token";
import { buildPasswordResetUrl, sendMail } from "@/lib/mail";
import { PasswordResetSchema } from "@/lib/validations";
import {
  handleApiError,
  requireJsonContentType,
} from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(
      getClientIp(request),
      "password-reset-request",
      5,
      60_000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many reset requests. Please try again later.",
        },
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
    const parsed = PasswordResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "No account found with this email address. Please check and try again.",
        },
        { status: 404 }
      );
    }

    const token = generateOpaqueToken();
    const tokenHash = hashOpaqueToken(token);
    const expiresAt = makeExpiryDate(PASSWORD_RESET_TTL_MS);

    await prisma.$transaction([
      prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
      prisma.passwordReset.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    const resetUrl = buildPasswordResetUrl(token);
    await sendMail({
      to: email,
      subject: "Reset your PATS password",
      text: [
        "Use this link to reset your password:",
        "",
        resetUrl,
        "",
        "This link expires in 30 minutes. If you did not request this, ignore this email.",
      ].join("\n"),
    });

    return NextResponse.json({
      success: true,
      message:
        "Reset link sent to your email address. Please check your inbox.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
