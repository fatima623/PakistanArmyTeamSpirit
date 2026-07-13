import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { revalidateEventPaths } from "@/lib/revalidate-public";
import {
  deleteEventImageFile,
  EVENT_ADMIN_SELECT,
} from "@/lib/storage/event-image";
import { EventUpdateSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

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
    revalidateEventPaths();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
