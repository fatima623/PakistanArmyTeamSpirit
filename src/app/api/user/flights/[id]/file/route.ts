import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requireAuth } from "@/lib/api-helpers";
import { readFlightDocByInternalPath } from "@/lib/storage/flight-doc";

type RouteContext = { params: Promise<{ id: string }> };

/** Serve the caller's own passport/ticket PDF (?type=passport|ticket). */
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const type = new URL(request.url).searchParams.get("type");
    if (type !== "passport" && type !== "ticket") {
      throw new ApiError("Invalid document type", 400);
    }

    const flight = await prisma.flightDetail.findFirst({
      where: { id, userId: session.user.id },
      select: {
        passportFilePath: true,
        passportFileName: true,
        ticketFilePath: true,
        ticketFileName: true,
      },
    });
    if (!flight) throw new ApiError("Flight record not found", 404);

    const internalPath =
      type === "passport" ? flight.passportFilePath : flight.ticketFilePath;
    const fileName =
      type === "passport" ? flight.passportFileName : flight.ticketFileName;
    if (!internalPath) throw new ApiError("Document not uploaded yet", 404);

    const payload = await readFlightDocByInternalPath(internalPath, fileName);
    return new NextResponse(new Uint8Array(payload.buffer), {
      headers: {
        "Content-Type": payload.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(payload.fileName)}"`,
        "Cache-Control": "private, no-store, no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
