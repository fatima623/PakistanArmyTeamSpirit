import type { Metadata } from "next";

import { EventsDetailView } from "@/components/events/EventsDetailView";
import { getPublishedEvents } from "@/lib/events-data";
import {
  applyTranslations,
  getTranslations,
} from "@/lib/i18n/content-translations";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.events.meta.title,
    description: t.events.meta.description,
  };
}

export default async function EventsDetailPage() {
  const [events, { locale }] = await Promise.all([
    getPublishedEvents(),
    getDictionary(),
  ]);

  // One batched query for the whole list — never per card. Only the free-text
  // fields (title/summary/details/participants) are substituted; `category`,
  // `difficulty` and `duration` stay RAW because EventsDetailView filters on
  // them and builds `ec-diff--${difficulty}` from the raw value. Those three are
  // localized for display inside the view via event-content-i18n.
  const translations = await getTranslations(
    "Event",
    events.map((e) => e.recordId),
    locale
  );
  const localized = events.map((e) =>
    applyTranslations(e, translations.get(e.recordId))
  );

  return <EventsDetailView events={localized} />;
}
