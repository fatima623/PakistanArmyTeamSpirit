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
  requireEditableFlights,
} from "@/lib/flights";
import {
  canEditFlights,
  isFlightDeadlinePassed,
} from "@/lib/participant-workflow";
import { saveFlightDoc } from "@/lib/storage/flight-doc";

/** The caller's flight details + editability flags. */
export async function GET() {
  try {
    const session = await requireAuth();
    const [flights, ctx] = await Promise.all([
      prisma.flightDetail.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        select: flightDetailSelect,
      }),
      loadFlightContext(session.user.id),
    ]);

    return NextResponse.json({
      flights,
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
      teamMemberId: formData.get("teamMemberId") || null,
      passengerName: formData.get("passengerName"),
      passportNumber: formData.get("passportNumber"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // The team submits a single, team-level flight record. A legacy per-member
    // id is still honoured, but the default flow links to no member.
    let teamMemberId: string | null = null;
    if (parsed.data.teamMemberId) {
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
      teamMemberId = teamMember.id;
    } else {
      const existing = await prisma.flightDetail.findFirst({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (existing) {
        throw new ApiError(
          "Flight details have already been submitted for your team — edit them instead",
          409
        );
      }
    }

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
      const message = err instanceof Error ? err.message : "Upload failed";
      throw new ApiError(message, 400);
    }

    const flight = await prisma.flightDetail.create({
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

    revalidatePath("/event/flights");
    revalidatePath("/event/dashboard");
    return NextResponse.json({ flight }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
