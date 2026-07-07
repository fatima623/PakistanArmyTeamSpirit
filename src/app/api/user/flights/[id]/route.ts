import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY } from "@/lib/constants";
import { ApiError, handleApiError, requireAuth } from "@/lib/api-helpers";
import { FlightDetailFieldsSchema } from "@/lib/validations";
import { flightDetailSelect, requireEditableFlights } from "@/lib/flights";
import {
  deleteFlightDocByInternalPath,
  saveFlightDoc,
} from "@/lib/storage/flight-doc";

type RouteContext = { params: Promise<{ id: string }> };

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
 * Update a flight record (multipart). New "passport"/"ticket" files replace
 * the stored ones; text fields update in place. Editable until the deadline
 * or administrative lock.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    await requireEditableFlights(session.user.id);

    const existing = await prisma.flightDetail.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) throw new ApiError("Flight record not found", 404);

    const formData = await request.formData();
    const parsed = FlightDetailFieldsSchema.safeParse({
      teamMemberId: formData.get("teamMemberId") ?? existing.teamMemberId,
      passengerName: formData.get("passengerName"),
      passportNumber: formData.get("passportNumber"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Traveler may be re-linked only to the caller's own roster members.
    if (parsed.data.teamMemberId !== existing.teamMemberId) {
      const teamMember = await prisma.teamMember.findFirst({
        where: { id: parsed.data.teamMemberId, userId: session.user.id },
        select: { id: true, flightDetail: { select: { id: true } } },
      });
      if (!teamMember) {
        throw new ApiError("Team member not found on your roster", 404);
      }
      if (teamMember.flightDetail && teamMember.flightDetail.id !== id) {
        throw new ApiError(
          "That traveler already has a flight record",
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

    const flight = await prisma.flightDetail.update({
      where: { id },
      data: {
        teamMemberId: parsed.data.teamMemberId,
        passengerName: parsed.data.passengerName,
        passportNumber: parsed.data.passportNumber,
        ...(passportUpload
          ? {
              passportFilePath: passportUpload.internalFilePath,
              passportFileName: passportUpload.originalFileName,
              passportFileSize: passportUpload.fileSize,
              passportUploadedAt: passportUpload.uploadedAt,
            }
          : {}),
        ...(ticketUpload
          ? {
              ticketFilePath: ticketUpload.internalFilePath,
              ticketFileName: ticketUpload.originalFileName,
              ticketFileSize: ticketUpload.fileSize,
              ticketUploadedAt: ticketUpload.uploadedAt,
            }
          : {}),
      },
      select: flightDetailSelect,
    });

    // Remove replaced files only after the DB update succeeded.
    if (passportUpload && existing.passportFilePath) {
      await deleteFlightDocByInternalPath(existing.passportFilePath);
    }
    if (ticketUpload && existing.ticketFilePath) {
      await deleteFlightDocByInternalPath(existing.ticketFilePath);
    }

    await createAuditLog({
      entityType: AUDIT_ENTITY.FLIGHT_DETAIL,
      entityId: id,
      action: "flight_detail_updated",
      actorId: session.user.id,
      metadata: {
        passengerName: parsed.data.passengerName,
        replacedPassport: !!passportUpload,
        replacedTicket: !!ticketUpload,
        actorRole: "user",
      },
    });

    revalidatePath("/event/flights");
    revalidatePath("/event/dashboard");
    return NextResponse.json({ flight });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Delete a flight record (and its stored PDFs) while unlocked. */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    await requireEditableFlights(session.user.id);

    const existing = await prisma.flightDetail.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, passportFilePath: true, ticketFilePath: true },
    });
    if (!existing) throw new ApiError("Flight record not found", 404);

    await prisma.flightDetail.delete({ where: { id } });
    await deleteFlightDocByInternalPath(existing.passportFilePath);
    await deleteFlightDocByInternalPath(existing.ticketFilePath);

    await createAuditLog({
      entityType: AUDIT_ENTITY.FLIGHT_DETAIL,
      entityId: id,
      action: "flight_detail_deleted",
      actorId: session.user.id,
      metadata: { actorRole: "user" },
    });

    revalidatePath("/event/flights");
    revalidatePath("/event/dashboard");
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
