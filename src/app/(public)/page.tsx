import type { Metadata } from "next";

import { HomeArmy } from "@/components/army/HomeArmy";
import { getKeyDates, getSiteSettings } from "@/lib/site-data";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.home };
}

export default async function HomePage() {
  const [settings, keyDates] = await Promise.all([
    getSiteSettings(),
    getKeyDates(),
  ]);

  return (
    <HomeArmy
      settings={settings}
      keyDates={keyDates.map((k) => ({
        id: k.id,
        label: k.label,
        value: k.value,
      }))}
    />
  );
}
