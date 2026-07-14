import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY } from "@/lib/constants";
import { ApiError, handleApiError, requireAuth } from "@/lib/api-helpers";
import { FlightDetailFieldsSchema } from "@/lib/validations";
import {
  flightDetailSelect,
  loadFlightContext,
  loadFlightCoverage,
  requireEditableFlights,
} from "@/lib/flights";
import {
  canEditFlights,
  isFlightDeadlinePassed,
} from "@/lib/participant-workflow";
import { teamMemberSelect } from "@/lib/team-members";
import {
  deleteFlightDocByInternalPath,
  saveFlightDoc,
} from "@/lib/storage/flight-doc";

/** The caller's roster, their flight records, coverage and editability flags. */
export async function GET() {
  try {
    const session = await requireAuth();
    const [flights, members, ctx, coverage] = await Promise.all([
      prisma.flightDetail.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        select: flightDetailSelect,
      }),
      prisma.teamMember.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        select: teamMemberSelect,
      }),
      loadFlightContext(session.user.id),
      loadFlightCoverage(session.user.id),
    ]);

    return NextResponse.json({
      flights,
      members,
      coverage,
      canEdit: canEditFlights(ctx.user, ctx.settings),
      deadline: ctx.settings.flightDetailsDeadline,
      deadlinePassed: isFlightDeadlinePassed(ctx.settings),
      finalizedAt: ctx.user.flightsFinalizedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function fileFromForm(
  formData: FormData,
  field: string
): Promise<{ buffer: Buffer; name: string; mime: string } | null> {
  const value = formData.get(field);
  if (!value || !(value instanceof File) || value.size === 0) return null;
  return {
    buffer: Buffer.from(await value.arrayBuffer()),
    name:
      typeof value.name === "string" && value.name.length > 0
        ? value.name
        : `${field}.pdf`,
    mime: value.type || "application/octet-stream",
  };
}

/**
 * Create a flight record for one traveler (multipart):
 * fields teamMemberId, passengerName, passportNumber; PDF files
 * "passport" and "ticket" (each optional here, replaceable until locked).
 */
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    await requireEditableFlights(session.user.id);

    const formData = await request.formData();
    const parsed = FlightDetailFieldsSchema.safeParse({
      teamMemberId: formData.get("teamMemberId"),
      passengerName: formData.get("passengerName"),
      passportNumber: formData.get("passportNumber"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Every record belongs to exactly one roster member — each traveller files
    // their own passport and ticket. The @unique on teamMemberId is the backstop.
    const teamMember = await prisma.teamMember.findFirst({
      where: { id: parsed.data.teamMemberId, userId: session.user.id },
      select: { id: true, flightDetail: { select: { id: true } } },
    });
    if (!teamMember) {
      throw new ApiError("Team member not found on your roster", 404);
    }
    if (teamMember.flightDetail) {
      throw new ApiError(
        "A flight record already exists for this traveler — edit it instead",
        409
      );
    }
    const teamMemberId = teamMember.id;

    const passportFile = await fileFromForm(formData, "passport");
    const ticketFile = await fileFromForm(formData, "ticket");

    let passportUpload = null;
    let ticketUpload = null;
    try {
      if (passportFile) {
        passportUpload = await saveFlightDoc({
          userId: session.user.id,
          kind: "passport",
          originalFileName: passportFile.name,
          buffer: passportFile.buffer,
          declaredMime: passportFile.mime,
        });
      }
      if (ticketFile) {
        ticketUpload = await saveFlightDoc({
          userId: session.user.id,
          kind: "ticket",
          originalFileName: ticketFile.name,
          buffer: ticketFile.buffer,
          declaredMime: ticketFile.mime,
        });
      }
    } catch (err) {
      // The passport is written before the ticket is validated, so a bad ticket
      // (e.g. a non-PDF renamed .pdf — the browser reports application/pdf, so
      // only the server's magic-byte check catches it) would strand the already
      // written passport scan on disk, once per retry.
      await deleteFlightDocByInternalPath(
        passportUpload?.internalFilePath ?? null
      );
      await deleteFlightDocByInternalPath(
        ticketUpload?.internalFilePath ?? null
      );
      const message = err instanceof Error ? err.message : "Upload failed";
      throw new ApiError(message, 400);
    }

    let flight;
    try {
      flight = await prisma.flightDetail.create({
        data: {
          userId: session.user.id,
          teamMemberId,
          passengerName: parsed.data.passengerName,
          passportNumber: parsed.data.passportNumber,
          passportFilePath: passportUpload?.internalFilePath ?? null,
          passportFileName: passportUpload?.originalFileName ?? null,
          passportFileSize: passportUpload?.fileSize ?? null,
          passportUploadedAt: passportUpload?.uploadedAt ?? null,
          ticketFilePath: ticketUpload?.internalFilePath ?? null,
          ticketFileName: ticketUpload?.originalFileName ?? null,
          ticketFileSize: ticketUpload?.fileSize ?? null,
          ticketUploadedAt: ticketUpload?.uploadedAt ?? null,
        },
        select: flightDetailSelect,
      });
    } catch (err) {
      // The PDFs are written before the row exists, so a failed create (e.g. a
      // double-submit racing the unique teamMemberId) would strand them on disk.
      await deleteFlightDocByInternalPath(
        passportUpload?.internalFilePath ?? null
      );
      await deleteFlightDocByInternalPath(
        ticketUpload?.internalFilePath ?? null
      );
      throw err;
    }

    await createAuditLog({
      entityType: AUDIT_ENTITY.FLIGHT_DETAIL,
      entityId: flight.id,
      action: "flight_detail_created",
      actorId: session.user.id,
      metadata: {
        passengerName: parsed.data.passengerName,
        hasPassport: !!passportUpload,
        hasTicket: !!ticketUpload,
        actorRole: "user",
      },
    });

    revalidatePath("/event/journey");
    revalidatePath("/event/dashboard");
    return NextResponse.json({ flight }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
