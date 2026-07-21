import { NextResponse } from "next/server";

import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import {
  parseTranslationsInput,
  saveTranslations,
} from "@/lib/admin-translations";
import { deleteTranslationsFor } from "@/lib/i18n/content-translations";
import { prisma } from "@/lib/prisma";
import { revalidateTickerPaths } from "@/lib/revalidate-public";
import { TickerAnnouncementSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = TickerAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.tickerAnnouncement.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new ApiError("Ticker not found", 404);
    }

    const { expiresAt, ...rest } = parsed.data;

    const ticker = await prisma.tickerAnnouncement.update({
      where: { id },
      data: {
        ...rest,
        shortLabel: null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const translations = parseTranslationsInput(
      "TickerAnnouncement",
      body?.translations
    );
    await saveTranslations({
      model: "TickerAnnouncement",
      recordId: ticker.id,
      translations,
      source: { message: ticker.message },
    });

    revalidateTickerPaths();

    return NextResponse.json({ ticker });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.tickerAnnouncement.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new ApiError("Ticker not found", 404);
    }

    await prisma.tickerAnnouncement.delete({ where: { id } });
    await deleteTranslationsFor("TickerAnnouncement", id);

    revalidateTickerPaths();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
