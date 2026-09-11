import type { Metadata } from "next";

import { LandingScreen } from "@/components/landing/LandingScreen";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getSiteSettings } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.home };
}

/**
 * `/` — the front page, and the only page open to an anonymous visitor.
 *
 * The exercise's own content (hero, mission, key dates, and every marketing
 * section) now lives behind the login as the portal's Tour, starting at
 * `/tour`. This page publishes nothing beyond the competition's name and
 * standfirst, and hands the visitor to the sign-in dialog.
 */
export default async function LandingPage() {
  const settings = await getSiteSettings();

  return <LandingScreen exerciseYear={settings.exerciseYear} />;
}
