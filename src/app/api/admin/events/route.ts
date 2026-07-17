import { NextResponse } from "next/server";

import {
  parseTranslationsFormField,
  parseTranslationsInput,
  saveTranslations,
} from "@/lib/admin-translations";
import { ApiError, handleApiError, requireAdmin } from "@/lib/api-helpers";
import { deleteTranslationsFor } from "@/lib/i18n/content-translations";
import { slugifyEventTitle } from "@/lib/events-data";
import { prisma } from "@/lib/prisma";
import { revalidateEventPaths } from "@/lib/revalidate-public";
import {
  deleteEventImageFile,
  EVENT_ADMIN_SELECT,
  MAX_EVENT_IMAGE_BYTES,
  saveEventImage,
} from "@/lib/storage/event-image";
import { EventSchema } from "@/lib/validations";

function formString(value: FormDataEntryValue | null): string {
  return value == null ? "" : String(value);
}
function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
function formBool(value: FormDataEntryValue | null): boolean | undefined {
  if (value == null) return undefined;
  const v = String(value).toLowerCase();
  if (v === "false" || v === "0" || v === "off") return false;
  if (v === "true" || v === "1" || v === "on") return true;
  return undefined;
}
function parseBreakdownField(value: FormDataEntryValue | null): unknown {
  const raw = value == null ? "" : String(value).trim();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
function mapImageError(error: unknown): ApiError | unknown {
  if (error instanceof Error) {
    if (error.message === "INVALID_IMAGE")
      return new ApiError(
        "Unsupported or invalid image. Use a JPG, PNG, WEBP or GIF.",
        400
      );
    if (error.message === "FILE_TOO_LARGE")
      return new ApiError("Image must be 8 MB or smaller.", 400);
  }
  return error;
}

/** Find a slug that is not already taken (append -2, -3 … on collision). */
async function uniqueEventSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  // Bounded loop — realistically resolves in one or two tries.
  while (n < 1000) {
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${n++}`;
  }
  return `${base}-${Date.now()}`;
}

export async function GET() {
  try {
    await requireAdmin();
    const events = await prisma.event.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: EVENT_ADMIN_SELECT,
    });
    return NextResponse.json({ events });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();

    const parsed = EventSchema.safeParse({
      title: formString(formData.get("title")),
      marks: formData.get("marks") ?? undefined,
      icon: formString(formData.get("icon")),
      category: formString(formData.get("category")),
      difficulty: formString(formData.get("difficulty")),
      duration: formString(formData.get("duration")),
      summary: formString(formData.get("summary")),
      details: formString(formData.get("details")),
      participants: formString(formData.get("participants")),
      breakdown: parseBreakdownField(formData.get("breakdown")),
      sortOrder: formData.get("sortOrder") ?? undefined,
      published: formBool(formData.get("published")),
    });
    if (!parsed.success)
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    const data = parsed.data;

    const file = formData.get("file");
    const hasFile = file instanceof File && file.size > 0;
    if (hasFile && file.size > MAX_EVENT_IMAGE_BYTES)
      throw new ApiError("Image must be 8 MB or smaller.", 400);

    // Validated before the row exists: a bad locale/field must 400 rather than
    // leave a half-created event behind.
    const translations = parseTranslationsInput(
      "Event",
      parseTranslationsFormField(formData.get("translations"))
    );

    const slug = await uniqueEventSlug(slugifyEventTitle(data.title));

    const created = await prisma.event.create({
      data: {
        slug,
        title: data.title,
        marks: data.marks ?? 0,
        icon: emptyToNull(data.icon) ?? "Target",
        category: data.category,
        difficulty: data.difficulty,
        duration: data.duration,
        summary: data.summary,
        details: data.details,
        participants: emptyToNull(data.participants),
        ...(data.breakdown && data.breakdown.length
          ? { breakdown: data.breakdown }
          : {}),
        sortOrder: data.sortOrder ?? 0,
        published: data.published ?? true,
      },
    });

    try {
      await saveTranslations({
        model: "Event",
        recordId: created.id,
        translations,
        source: {
          title: created.title,
          summary: created.summary,
          details: created.details,
          participants: created.participants,
        },
      });
    } catch (err) {
      // Same rollback contract as the image path below: never leave an event
      // whose save reported a failure.
      await prisma.event
        .delete({ where: { id: created.id } })
        .catch(() => undefined);
      await deleteTranslationsFor("Event", created.id).catch(() => undefined);
      return handleApiError(err);
    }

    if (!hasFile) {
      const event = await prisma.event.findUnique({
        where: { id: created.id },
        select: EVENT_ADMIN_SELECT,
      });
      revalidateEventPaths();
      return NextResponse.json({ event }, { status: 201 });
    }

    let savedPath: string | null = null;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const saved = await saveEventImage({
        id: created.id,
        buffer,
        declaredMime: file.type || "",
      });
      savedPath = saved.thumbnailPath;
      const event = await prisma.event.update({
        where: { id: created.id },
        data: saved,
        select: EVENT_ADMIN_SELECT,
      });
      revalidateEventPaths();
      return NextResponse.json({ event }, { status: 201 });
    } catch (err) {
      await prisma.event
        .delete({ where: { id: created.id } })
        .catch(() => undefined);
      await deleteTranslationsFor("Event", created.id).catch(() => undefined);
      if (savedPath) await deleteEventImageFile(savedPath).catch(() => undefined);
      return handleApiError(mapImageError(err));
    }
  } catch (error) {
    return handleApiError(error);
  }
}
