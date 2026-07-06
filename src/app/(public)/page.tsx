import type { Metadata } from "next";

import { HomeArmy } from "@/components/army/HomeArmy";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import {
  getKeyDates,
  getLatestNews,
  getSiteSettings,
} from "@/lib/site-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Home",
};

export default async function HomePage() {
  const [settings, newsPosts, keyDates] = await Promise.all([
    getSiteSettings(),
    getLatestNews(5),
    getKeyDates(),
  ]);

  const featured = newsPosts[0];
  const featuredHtml = featured
    ? sanitizeNewsContent(featured.content)
    : null;

  return (
    <HomeArmy
      settings={settings}
      keyDates={keyDates.map((k) => ({
        id: k.id,
        label: k.label,
        value: k.value,
      }))}
      newsPosts={newsPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        publishedAt: new Date(p.publishedAt).toISOString(),
      }))}
      featuredHtml={featuredHtml}
    />
  );
}
