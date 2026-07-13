import type { Metadata } from "next";

import {
  EventsManager,
  type AdminEvent,
  type EventBreakdownItem,
} from "@/components/admin/EventsManager";
import { adminNavLabel } from "@/lib/admin-navigation";
import { prisma } from "@/lib/prisma";
import { EVENT_ADMIN_SELECT } from "@/lib/storage/event-image";

export const metadata: Metadata = { title: adminNavLabel("events") };

export default async function AdminEventsPage() {
  let events: AdminEvent[] = [];
  try {
    const rows = await prisma.event.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: EVENT_ADMIN_SELECT,
    });
    events = rows.map((r) => ({
      ...r,
      breakdown: Array.isArray(r.breakdown)
        ? (r.breakdown as unknown as EventBreakdownItem[])
        : null,
    }));
  } catch {
    // Migration not applied yet — render an empty manager rather than a 500.
    events = [];
  }
  return <EventsManager initialEvents={events} />;
}
