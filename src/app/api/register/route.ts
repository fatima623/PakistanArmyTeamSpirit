import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";
import { getClientIp, checkRateLimit } from "@/lib/compliance/rate-limit";
import { validateAuthCsrfToken } from "@/lib/auth-csrf";
import {
  EMAIL_VERIFICATION_TTL_MS,
  makeExpiryDate,
} from "@/lib/auth-security";
import { generateOpaqueToken, hashOpaqueToken } from "@/lib/auth-token";
import { buildEmailVerificationUrl, sendMail } from "@/lib/mail";
import {
  APPLICATION_STATUS,
  AUDIT_ENTITY,
  PAYMENT_STATUS,
} from "@/lib/constants";
import { createAuditLog } from "@/lib/audit";
import { getDeadlines, registrationClosedByDeadline } from "@/lib/deadlines";
import { resolveCountryForSubmit } from "@/lib/countries";
import { resolveNationalityForSubmit } from "@/lib/participant-country";
import { RegisterSchema } from "@/lib/validations";
import {
  handleApiError,
  requireJsonContentType,
} from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getClientIp(request), "register", 5, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait and try again." },
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
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const country = resolveCountryForSubmit(data.country, data.customCountry);
    if (!country) {
      return NextResponse.json(
        { errors: { customCountry: ["Please enter your country"] } },
        { status: 400 }
      );
    }
    const email = data.email.toLowerCase().trim();

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { registrationOpen: true, intlRegistrationOpen: true },
    });

    if (settings && !settings.registrationOpen) {
      return NextResponse.json(
        { error: "Registration is currently closed" },
        { status: 403 }
      );
    }

    const deadlines = await getDeadlines();
    if (registrationClosedByDeadline(deadlines)) {
      return NextResponse.json(
        { error: "The registration deadline has passed." },
        { status: 403 }
      );
    }

    if (
      data.unitType === "International" &&
      settings &&
      !settings.intlRegistrationOpen
    ) {
      return NextResponse.json(
        { error: "International registration is currently closed" },
        { status: 403 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const now = new Date();
    const verificationToken = generateOpaqueToken();
    const verificationTokenHash = hashOpaqueToken(verificationToken);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerifiedAt: null,
        firstName: data.firstName,
        lastName: data.lastName,
        rank: data.rank,
        gender: data.gender,
        country,
        nationality: resolveNationalityForSubmit(country, data.nationality),
        applicationStatus: APPLICATION_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.PENDING,
        approved: false,
        privacyAccepted: true,
        privacyAcceptedAt: now,
        teamMembers:
          data.teamMembers && data.teamMembers.length > 0
            ? {
                create: data.teamMembers.map((member) => ({
                  fullName: member.fullName,
                  serviceNumber: member.serviceNumber,
                  serviceArm: member.serviceArm,
                  gender: member.gender,
                })),
              }
            : undefined,
        unit: {
          create: {
            unitType: data.unitType,
            jointPatrol: data.jointPatrol,
            branch: data.branch,
            unitName: data.unitName,
            bdeOrFmn: data.bdeOrFmn,
            divOrFmn: data.divOrFmn,
            arm: data.arm,
            service: data.service,
            unitAddress: data.unitAddress,
            postcode: data.postcode,
            telephoneMil: data.telephoneMil,
            telephoneCiv: data.telephoneCiv,
            secondPocEmail: data.secondPocEmail || null,
            thirdPocEmail: data.thirdPocEmail || null,
            additionalInfo: data.additionalInfo ?? null,
            coName: data.coName,
            coEmail: data.coEmail,
            coPhone: data.coPhone,
            coRank: data.coRank,
            coSalutations: data.coSalutations ?? null,
            canAccommodateIntl: data.canAccommodateIntl,
            preferredIntlPatrol: data.preferredIntlPatrol ?? null,
            longStandingRelation: data.longStandingRelation,
          },
        },
      },
      select: { id: true, email: true, firstName: true },
    });

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash: verificationTokenHash,
        expiresAt: makeExpiryDate(EMAIL_VERIFICATION_TTL_MS),
      },
    });

    const verificationUrl = buildEmailVerificationUrl(verificationToken);
    // The user is already persisted; a mail outage must not 500 the request
    // (that would orphan the account and block re-registration with a 409).
    try {
      await sendMail({
        to: email,
        subject: "Verify your PATS account",
        text: [
          `Hello ${data.firstName},`,
          "",
          "Verify your email to activate your PATS portal account:",
          verificationUrl,
          "",
          "This link expires in 24 hours.",
        ].join("\n"),
        html: `
        <p>Hello ${data.firstName},</p>
        <p>Verify your email to activate your PATS portal account:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 24 hours.</p>
      `,
      });
    } catch (mailError) {
      console.error(
        `[register] verification email failed to send for "${email}":`,
        mailError
      );
      if (process.env.NODE_ENV === "development") {
        console.warn(`[register] verification link: ${verificationUrl}`);
      }
    }

    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: user.id,
      action: "registration_submitted",
      metadata: { email },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration submitted. Please verify your email before logging in.",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
