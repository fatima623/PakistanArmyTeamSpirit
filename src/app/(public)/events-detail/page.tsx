import type { Metadata } from "next";

import { EventsDetailView } from "@/components/events/EventsDetailView";
import { getPublishedEvents } from "@/lib/events-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Events Detail",
  description:
    "Every scored serial of the Pakistan Army Team Spirit exercise — marks, difficulty and the full brief behind each competition event.",
};

export default async function EventsDetailPage() {
  const events = await getPublishedEvents();
  return <EventsDetailView events={events} />;
}
