import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";
import {
  AdminResetPasswordSchema,
  AdminUserUpdateSchema,
} from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireStaff,
  requireJsonContentType,
  userSelect,
} from "@/lib/api-helpers";
import {
  PARTICIPANT_ROLE,
  canApproveRegistration,
  canManageSystem,
  canVerifyPayment,
} from "@/lib/auth-routes";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY, APPLICATION_STATUS } from "@/lib/constants";
import { buildApplicationUpdateData } from "@/lib/payments";
import { sendRegistrationApprovedEmail } from "@/lib/participant-status-emails";
import { normalizeApplicationStatus } from "@/lib/user-status";
import { deleteFlightDocByInternalPath } from "@/lib/storage/flight-doc";
import { resolveCountryForSubmit } from "@/lib/countries";
import { resolveNationalityForSubmit } from "@/lib/participant-country";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireStaff();
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
        unit: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { entityType: AUDIT_ENTITY.USER, entityId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json({ user, auditLogs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    // Role-based responsibilities:
    //   • Registration verification (applicationStatus / approved / reason)
    //     → SD (Sports Directorate) ONLY. Admin & MT are read-only.
    //   • Payment status → MT (Management Team) ONLY (normally via the
    //     payments route; mirrored field guarded identically here).
    //   • Account management (profile, role, suspension, notes, password)
    //     → Admin ONLY.
    const session = await requireStaff();
    const isAdmin = canManageSystem(session.user.role);
    const isRegistrationVerifier = canApproveRegistration(session.user.role);
    const isPaymentVerifierRole = canVerifyPayment(session.user.role);
    requireJsonContentType(request);
    const { id } = await context.params;
    const body = await request.json();

    if (body.newPassword !== undefined) {
      if (!isAdmin) {
        throw new ApiError("Forbidden", 403);
      }
      const parsed = AdminResetPasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        throw new ApiError("User not found", 404);
      }
      const passwordHash = await bcrypt.hash(
        parsed.data.newPassword,
        BCRYPT_ROUNDS
      );
      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });
      await createAuditLog({
        entityType: AUDIT_ENTITY.USER,
        entityId: id,
        action: "password_reset_by_admin",
        actorId: session.user.id,
      });
      return NextResponse.json({ success: true });
    }

    const parsed = AdminUserUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const editsProfile =
      parsed.data.firstName !== undefined ||
      parsed.data.lastName !== undefined ||
      parsed.data.email !== undefined ||
      parsed.data.rank !== undefined ||
      parsed.data.gender !== undefined ||
      parsed.data.country !== undefined ||
      parsed.data.nationality !== undefined;

    const editsApplicationDecision =
      parsed.data.applicationStatus !== undefined ||
      parsed.data.approved !== undefined ||
      parsed.data.rejectionReason !== undefined;

    if (editsApplicationDecision && !isRegistrationVerifier) {
      throw new ApiError(
        "Registration verification is performed by the SD (Sports Directorate) only. Your role has view-only access.",
        403
      );
    }

    if (parsed.data.paymentStatus !== undefined && !isPaymentVerifierRole) {
      throw new ApiError(
        "Payment verification is performed by the MT (Management Team) only. Your role has view-only access.",
        403
      );
    }

    if (
      !isAdmin &&
      (parsed.data.role !== undefined ||
        parsed.data.suspended !== undefined ||
        parsed.data.adminNotes !== undefined ||
        editsProfile)
    ) {
      throw new ApiError(
        "Only administrators can change account details, roles, suspension, or notes",
        403
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("User not found", 404);
    }

    if (parsed.data.email !== undefined) {
      const nextEmail = parsed.data.email.toLowerCase().trim();
      if (nextEmail !== existing.email) {
        const clash = await prisma.user.findUnique({
          where: { email: nextEmail },
        });
        if (clash && clash.id !== id) {
          throw new ApiError("A user with this email already exists", 409);
        }
      }
    }

    const wasApproved =
      existing.approved ||
      normalizeApplicationStatus(existing.applicationStatus) ===
        APPLICATION_STATUS.APPROVED;

    const data: Record<string, unknown> = {};

    if (parsed.data.firstName !== undefined) {
      data.firstName = parsed.data.firstName.trim();
    }
    if (parsed.data.lastName !== undefined) {
      data.lastName = parsed.data.lastName.trim();
    }
    if (
      parsed.data.country !== undefined ||
      parsed.data.nationality !== undefined
    ) {
      /* Country and nationality are resolved TOGETHER against the stored row,
         never independently:
           - only participants have a country (a crafted PUT must not stamp one
             on an SD/MT/admin/host account, nor on a role change to staff);
           - a country-only edit must not blank an existing nationality;
           - a nationality-only edit must still honour the stored country, so
             "Pakistani iff Pakistan" cannot be violated;
           - "Other" collapses to the typed-in customCountry, exactly as public
             registration resolves it. */
      const targetRole = parsed.data.role ?? existing.role;
      if (targetRole !== PARTICIPANT_ROLE) {
        throw new ApiError(
          "Country and nationality apply to participants only",
          400
        );
      }

      const country =
        parsed.data.country !== undefined
          ? resolveCountryForSubmit(
              parsed.data.country,
              parsed.data.customCountry
            )
          : (existing.country ?? "");
      if (!country.trim()) {
        throw new ApiError("Select a country for this participant", 400);
      }

      const suppliedNationality =
        parsed.data.nationality !== undefined
          ? (parsed.data.nationality ?? "")
          : (existing.nationality ?? "");
      const nationality = resolveNationalityForSubmit(
        country,
        suppliedNationality
      );
      if (!nationality.trim()) {
        throw new ApiError(
          "Nationality is required for international participants",
          400
        );
      }

      data.country = country;
      data.nationality = nationality;
    }
    if (parsed.data.email !== undefined) {
      data.email = parsed.data.email.toLowerCase().trim();
    }
    if (parsed.data.rank !== undefined) data.rank = parsed.data.rank.trim();
    if (parsed.data.gender !== undefined) data.gender = parsed.data.gender;
    if (parsed.data.role !== undefined) data.role = parsed.data.role;
    if (parsed.data.adminNotes !== undefined) {
      data.adminNotes = parsed.data.adminNotes;
    }
    if (parsed.data.suspended !== undefined) {
      data.suspended = parsed.data.suspended;
    }
    if (parsed.data.paymentStatus !== undefined) {
      data.paymentStatus = parsed.data.paymentStatus;
    }

    if (parsed.data.applicationStatus !== undefined) {
      Object.assign(
        data,
        buildApplicationUpdateData(
          parsed.data.applicationStatus,
          parsed.data.rejectionReason
        )
      );
    } else if (parsed.data.approved !== undefined) {
      data.approved = parsed.data.approved;
      if (parsed.data.approved) {
        data.applicationStatus = APPLICATION_STATUS.APPROVED;
        data.approvedAt = new Date();
        data.rejectedAt = null;
        data.rejectionReason = null;
      } else if (existing.applicationStatus === APPLICATION_STATUS.APPROVED) {
        data.applicationStatus = APPLICATION_STATUS.PENDING;
        data.approvedAt = null;
      }
    }

    if (
      parsed.data.rejectionReason !== undefined &&
      parsed.data.applicationStatus === undefined
    ) {
      data.rejectionReason = parsed.data.rejectionReason;
    }

    /* Participant Unit / CO fields — admin-only (profile-class) and only for
       participants. Upserted, so a participant created before this form existed
       (with no Unit row) still gets one; only the keys actually sent are
       updated, while a fresh create fills the retired legacy columns. */
    const unitFieldsPresent =
      parsed.data.unitType !== undefined ||
      parsed.data.branch !== undefined ||
      parsed.data.unitName !== undefined ||
      parsed.data.arm !== undefined ||
      parsed.data.secondPocEmail !== undefined ||
      parsed.data.thirdPocEmail !== undefined ||
      parsed.data.additionalInfo !== undefined ||
      parsed.data.coName !== undefined ||
      parsed.data.coEmail !== undefined ||
      parsed.data.coPhone !== undefined;

    if (unitFieldsPresent) {
      if (!isAdmin) {
        throw new ApiError("Only administrators can edit unit details", 403);
      }
      const targetRole = parsed.data.role ?? existing.role;
      if (targetRole !== PARTICIPANT_ROLE) {
        throw new ApiError("Unit details apply to participants only", 400);
      }

      const unitUpdate: Record<string, unknown> = {};
      if (parsed.data.unitType !== undefined)
        unitUpdate.unitType = parsed.data.unitType;
      if (parsed.data.branch !== undefined)
        unitUpdate.branch = parsed.data.branch;
      if (parsed.data.unitName !== undefined)
        unitUpdate.unitName = parsed.data.unitName;
      if (parsed.data.arm !== undefined) unitUpdate.arm = parsed.data.arm;
      if (parsed.data.secondPocEmail !== undefined)
        unitUpdate.secondPocEmail = parsed.data.secondPocEmail || null;
      if (parsed.data.thirdPocEmail !== undefined)
        unitUpdate.thirdPocEmail = parsed.data.thirdPocEmail || null;
      if (parsed.data.additionalInfo !== undefined)
        unitUpdate.additionalInfo = parsed.data.additionalInfo || null;
      if (parsed.data.coName !== undefined)
        unitUpdate.coName = parsed.data.coName;
      if (parsed.data.coEmail !== undefined)
        unitUpdate.coEmail = parsed.data.coEmail;
      if (parsed.data.coPhone !== undefined)
        unitUpdate.coPhone = parsed.data.coPhone;

      data.unit = {
        upsert: {
          create: {
            unitType: parsed.data.unitType ?? "Regular",
            branch: parsed.data.branch ?? "Army",
            unitName: parsed.data.unitName ?? "",
            arm: parsed.data.arm ?? "",
            secondPocEmail: parsed.data.secondPocEmail || null,
            thirdPocEmail: parsed.data.thirdPocEmail || null,
            additionalInfo: parsed.data.additionalInfo || null,
            coName: parsed.data.coName ?? "",
            coEmail: parsed.data.coEmail ?? "",
            coPhone: parsed.data.coPhone ?? "",
            jointPatrol: false,
            bdeOrFmn: "",
            divOrFmn: "",
            service: "",
            unitAddress: "",
            postcode: "",
            telephoneMil: "",
            telephoneCiv: "",
            coRank: "",
            coSalutations: null,
            canAccommodateIntl: false,
            preferredIntlPatrol: null,
            longStandingRelation: false,
          },
          update: unitUpdate,
        },
      };
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        ...userSelect,
        unit: true,
      },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: id,
      action: editsApplicationDecision
        ? "registration_verification_updated"
        : "account_updated",
      actorId: session.user.id,
      metadata: { ...parsed.data, actorRole: session.user.role },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    revalidatePath("/event/dashboard");

    const newlyApproved =
      !wasApproved &&
      (user.approved ||
        normalizeApplicationStatus(user.applicationStatus) ===
          APPLICATION_STATUS.APPROVED);

    if (newlyApproved) {
      try {
        await sendRegistrationApprovedEmail({
          email: user.email,
          firstName: user.firstName,
        });
      } catch (emailError) {
        console.error(
          "[admin/users] Failed to send registration approved email",
          { userId: id, emailError }
        );
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;

    if (id === session.user.id) {
      throw new ApiError("Cannot delete your own account", 400);
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      include: {
        flightDetails: {
          select: { passportFilePath: true, ticketFilePath: true },
        },
      },
    });
    if (!existing) {
      throw new ApiError("User not found", 404);
    }

    await prisma.user.delete({ where: { id } });

    // FlightDetail rows cascade with the user, but their stored PDFs do not —
    // unlink them after the DB commit or every deleted participant leaves their
    // team's passport and ticket scans on disk forever. Best-effort.
    for (const flight of existing.flightDetails) {
      await deleteFlightDocByInternalPath(flight.passportFilePath);
      await deleteFlightDocByInternalPath(flight.ticketFilePath);
    }

    await createAuditLog({
      entityType: AUDIT_ENTITY.USER,
      entityId: id,
      action: "user_deleted",
      actorId: session.user.id,
      metadata: {
        email: existing.email,
        flightDocsRemoved: existing.flightDetails.length,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
