import "server-only";

import type { Prisma } from "@prisma/client";

import type {
  ContourEvent,
  Difficulty,
  EventCategory,
  MarkBreakdown,
} from "@/lib/exercise-contour";
import { prisma } from "@/lib/prisma";
import { eventImageUrl, EVENT_PUBLIC_SELECT } from "@/lib/storage/event-image";

/** A public-facing event = the ContourEvent shape + an optional card thumbnail. */
export type PublicEvent = ContourEvent & { thumbnailUrl: string | null };

/** Coerce the stored JSON breakdown into an ordered MarkBreakdown[]. */
export function parseBreakdown(
  value: Prisma.JsonValue | null | undefined
): MarkBreakdown[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items: MarkBreakdown[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const label = String(record.label ?? "").trim();
    const marks = Number(record.marks ?? 0);
    if (label) items.push({ label, marks: Number.isFinite(marks) ? marks : 0 });
  }
  return items.length ? items : undefined;
}

type EventPublicRow = Prisma.EventGetPayload<{ select: typeof EVENT_PUBLIC_SELECT }>;

export function mapToPublicEvent(row: EventPublicRow): PublicEvent {
  return {
    id: row.slug,
    title: row.title,
    marks: row.marks,
    icon: row.icon,
    category: row.category as EventCategory,
    difficulty: row.difficulty as Difficulty,
    duration: row.duration,
    summary: row.summary,
    details: row.details,
    breakdown: parseBreakdown(row.breakdown),
    participants: row.participants ?? undefined,
    thumbnailUrl: row.thumbnailPath ? eventImageUrl(row.thumbnailPath) : null,
  };
}

/** Published events for the public Events Detail page (ordered for display). */
export async function getPublishedEvents(): Promise<PublicEvent[]> {
  const rows = await prisma.event.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: EVENT_PUBLIC_SELECT,
  });
  return rows.map(mapToPublicEvent);
}

/** Slugify a title into a kebab-case identifier. */
export function slugifyEventTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "event"
  );
}
