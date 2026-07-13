import { NextResponse } from "next/server";

import { ApiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { revalidateEventPaths } from "@/lib/revalidate-public";
import {
  deleteEventImageFile,
  EVENT_ADMIN_SELECT,
  MAX_EVENT_IMAGE_BYTES,
  saveEventImage,
} from "@/lib/storage/event-image";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Event not found", 404);

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new ApiError("Image file is required", 400);
    if (file.size > MAX_EVENT_IMAGE_BYTES)
      throw new ApiError("Image must be 8 MB or smaller.", 400);
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const saved = await saveEventImage({
        id,
        buffer,
        declaredMime: file.type || "",
      });
      // Extension may change (e.g. png -> jpg): remove the stale file.
      if (existing.thumbnailPath && existing.thumbnailPath !== saved.thumbnailPath)
        await deleteEventImageFile(existing.thumbnailPath);
      const event = await prisma.event.update({
        where: { id },
        data: saved,
        select: EVENT_ADMIN_SELECT,
      });
      revalidateEventPaths();
      return NextResponse.json({ event });
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_IMAGE")
        return handleApiError(
          new ApiError(
            "Unsupported or invalid image. Use a JPG, PNG, WEBP or GIF.",
            400
          )
        );
      if (err instanceof Error && err.message === "FILE_TOO_LARGE")
        return handleApiError(new ApiError("Image must be 8 MB or smaller.", 400));
      return handleApiError(err);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
