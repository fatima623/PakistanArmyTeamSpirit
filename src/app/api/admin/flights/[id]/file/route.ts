import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requireStaff } from "@/lib/api-helpers";
import { readFlightDoc } from "@/lib/storage/flight-doc";

type RouteContext = { params: Promise<{ id: string }> };

/** Staff review access to uploaded passport/ticket PDFs (?type=…). */
export async function GET(request: Request, context: RouteContext) {
  try {
    await requireStaff();
    const { id } = await context.params;
    const type = new URL(request.url).searchParams.get("type");
    if (type !== "passport" && type !== "ticket" && type !== "returnTicket") {
      throw new ApiError("Invalid document type", 400);
    }

    const flight = await prisma.flightDetail.findUnique({
      where: { id },
      select: {
        passportFilePath: true,
        passportFileName: true,
        passportData: true,
        ticketFilePath: true,
        ticketFileName: true,
        ticketData: true,
        returnTicketFilePath: true,
        returnTicketFileName: true,
        returnTicketData: true,
      },
    });
    if (!flight) throw new ApiError("Flight record not found", 404);

    const internalPath =
      type === "passport"
        ? flight.passportFilePath
        : type === "ticket"
          ? flight.ticketFilePath
          : flight.returnTicketFilePath;
    const fileName =
      type === "passport"
        ? flight.passportFileName
        : type === "ticket"
          ? flight.ticketFileName
          : flight.returnTicketFileName;
    const data =
      type === "passport"
        ? flight.passportData
        : type === "ticket"
          ? flight.ticketData
          : flight.returnTicketData;
    if (!internalPath) throw new ApiError("Document not uploaded yet", 404);

    const payload = await readFlightDoc({
      data,
      internalFilePath: internalPath,
      downloadName: fileName,
    });
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
