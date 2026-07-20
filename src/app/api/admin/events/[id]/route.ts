import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  buildTranslationSeed,
  parseTranslationsInput,
  saveTranslations,
} from "@/lib/admin-translations";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { deleteTranslationsFor } from "@/lib/i18n/content-translations";
import { prisma } from "@/lib/prisma";
import { revalidateEventPaths } from "@/lib/revalidate-public";
import {
  deleteEventImageFile,
  EVENT_ADMIN_SELECT,
} from "@/lib/storage/event-image";
import { EventUpdateSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

/** Existing translations + staleness, loaded when the edit dialog opens. */
export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const event = await prisma.event.findUnique({
      where: { id },
      select: EVENT_ADMIN_SELECT,
    });
    if (!event) throw new ApiError("Event not found", 404);

    const translations = await buildTranslationSeed("Event", id, {
      title: event.title,
      summary: event.summary,
      details: event.details,
      participants: event.participants,
    });

    return NextResponse.json({ translations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const { id } = await context.params;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Event not found", 404);

    const body = await request.json();
    const parsed = EventUpdateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );

    // Absent `translations` leaves the stored rows untouched — that is what
    // lets the publish toggle PATCH `{ published }` alone without wiping them.
    const translations = parseTranslationsInput("Event", body?.translations);

    const d = parsed.data;
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.marks !== undefined ? { marks: d.marks } : {}),
        ...(d.icon !== undefined
          ? { icon: d.icon.trim() ? d.icon.trim() : "Target" }
          : {}),
        ...(d.category !== undefined ? { category: d.category } : {}),
        ...(d.difficulty !== undefined ? { difficulty: d.difficulty } : {}),
        ...(d.duration !== undefined ? { duration: d.duration } : {}),
        ...(d.summary !== undefined ? { summary: d.summary } : {}),
        ...(d.details !== undefined ? { details: d.details } : {}),
        ...(d.participants !== undefined
          ? { participants: d.participants.trim() ? d.participants.trim() : null }
          : {}),
        ...(d.breakdown !== undefined
          ? d.breakdown.length
            ? { breakdown: d.breakdown }
            : { breakdown: Prisma.JsonNull }
          : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        ...(d.published !== undefined ? { published: d.published } : {}),
      },
      select: EVENT_ADMIN_SELECT,
    });

    // Hash the English written by THIS request, so editing English and its
    // translation together does not immediately flag the translation stale.
    await saveTranslations({
      model: "Event",
      recordId: id,
      translations,
      source: {
        title: event.title,
        summary: event.summary,
        details: event.details,
        participants: event.participants,
      },
    });

    revalidateEventPaths();
    return NextResponse.json({ event });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Event not found", 404);

    await deleteEventImageFile(existing.thumbnailPath);
    await prisma.event.delete({ where: { id } });
    // No FK on Translation — orphan rows are this route's responsibility.
    await deleteTranslationsFor("Event", id);
    revalidateEventPaths();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
