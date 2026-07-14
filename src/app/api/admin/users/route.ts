import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
  requireStaff,
  userSelect,
} from "@/lib/api-helpers";
import { BCRYPT_ROUNDS } from "@/lib/password-policy";
import { AdminCreateUserSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";
import {
  APPLICATION_STATUS,
  AUDIT_ENTITY,
  PAYMENT_STATUS,
} from "@/lib/constants";
import { PARTICIPANT_ROLE, isStaffRole } from "@/lib/auth-routes";
import { resolveCountryForSubmit } from "@/lib/countries";
import { resolveNationalityForSubmit } from "@/lib/participant-country";
import { toCsv } from "@/lib/csv";

const PAGE_SIZE = 25;

function buildUserWhere(
  search: string | null,
  filter: string | null
): Prisma.UserWhereInput {
  /* Participants only by default. Without this, the JSON list AND the CSV
     export (which emits a `role` column) returned every admin/SD/MT/host
     account. The `filter=admin` branch below deliberately overwrites it. */
  const where: Prisma.UserWhereInput = { role: PARTICIPANT_ROLE };

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ];
  }

  if (filter === "approved") {
    where.approved = true;
  } else if (filter === "pending") {
    where.approved = false;
  } else if (filter === "admin") {
    where.role = "admin";
  }

  return where;
}

export async function GET(request: Request) {
  try {
    await requireStaff();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const search = searchParams.get("search")?.trim() || null;
    const filter = searchParams.get("filter");
    const where = buildUserWhere(search, filter);

    if (format === "csv") {
      const users = await prisma.user.findMany({
        where,
        select: {
          ...userSelect,
          unit: { select: { unitName: true, unitType: true, branch: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const headers = [
        "id",
        "email",
        "firstName",
        "lastName",
        "rank",
        "gender",
        "country",
        "nationality",
        "role",
        "approved",
        "privacyAccepted",
        "unitName",
        "unitType",
        "branch",
        "createdAt",
      ];

      const rows = users.map((u) => [
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        u.rank,
        u.gender,
        u.country ?? "",
        u.nationality ?? "",
        u.role,
        u.approved,
        u.privacyAccepted,
        u.unit?.unitName ?? "",
        u.unit?.unitType ?? "",
        u.unit?.branch ?? "",
        u.createdAt.toISOString(),
      ]);

      return new NextResponse(toCsv(headers, rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="users.csv"',
        },
      });
    }

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          ...userSelect,
          unit: { select: { id: true, unitName: true, unitType: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = AdminCreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError("A user with this email already exists", 409);
    }

    const staff = isStaffRole(parsed.data.role);
    const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
    const now = new Date();

    /* Resolve country exactly as public registration does ("Other" collapses to
       the typed-in customCountry; Pakistan implies Pakistani nationality).
       Staff accounts are not participants, so they carry no country. */
    const country =
      !staff && parsed.data.country?.trim()
        ? resolveCountryForSubmit(parsed.data.country, parsed.data.customCountry)
        : null;
    const nationality = country
      ? resolveNationalityForSubmit(country, parsed.data.nationality)
      : null;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        rank: parsed.data.rank,
        gender: parsed.data.gender,
        role: parsed.data.role,
        country,
        nationality,
        approved: staff,
        applicationStatus: staff
          ? APPLICATION_STATUS.APPROVED
          : APPLICATION_STATUS.PENDING,
        paymentStatus: staff
          ? PAYMENT_STATUS.VERIFIED
          : PAYMENT_STATUS.PENDING,
        emailVerifiedAt: now,
        privacyAccepted: true,
        privacyAcceptedAt: now,
      },
      select: { id: true },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: user.id,
      action: "user_created_by_admin",
      actorId: session.user.id,
      metadata: { email, role: parsed.data.role, country },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
