import { NextResponse } from "next/server";

import {
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import {
  autoTranslateMissing,
  parseTranslationsInput,
  saveTranslations,
} from "@/lib/admin-translations";
import { revalidateTickerPaths } from "@/lib/revalidate-public";
import { listAllTickerAnnouncements } from "@/lib/ticker-data";
import { TickerAnnouncementSchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireAdmin();
    const tickers = await listAllTickerAnnouncements();
    return NextResponse.json({ tickers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = TickerAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { expiresAt, ...rest } = parsed.data;

    const ticker = await prisma.tickerAnnouncement.create({
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
    // Auto-translate the message into any language the admin left blank.
    await autoTranslateMissing("TickerAnnouncement", ticker.id, {
      message: { text: ticker.message },
    });

    revalidateTickerPaths();

    return NextResponse.json({ ticker }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
