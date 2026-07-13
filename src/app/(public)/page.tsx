import type { Metadata } from "next";

import { HomeArmy } from "@/components/army/HomeArmy";
import { getKeyDates, getSiteSettings } from "@/lib/site-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Home",
};

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
