import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { announcementExcerpt } from "@/lib/announcement-excerpt";
import {
  applyTranslations,
  getTranslations,
} from "@/lib/i18n/content-translations";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAnnouncements } from "@/lib/site-data";
import { formatDateLong } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.meta.announcements,
    description:
      "Latest announcements and updates for the Pakistan Army Team Spirit (PATS) competition.",
  };
}

export default async function AnnouncementsPage() {
  const [posts, { t, locale }] = await Promise.all([
    getAnnouncements(),
    getDictionary(),
  ]);
  const a11n = t.publicSite.announcements;

  // Translated OUTSIDE the unstable_cache'd fetch in site-data: that cache is
  // keyed per-fetch, not per-locale, so caching a localized list there would
  // serve one locale's text to every other language.
  //
  // `slug` is never translated — it is the lookup key for /announcements/[slug].
  // `content` is only used for the plain-text excerpt here (announcementExcerpt
  // strips tags and escapes on write via a JSX text node), so no HTML reaches
  // the DOM on this route.
  const translations = await getTranslations(
    "NewsPost",
    posts.map((p) => p.id),
    locale
  );
  const announcements = posts.map((p) =>
    applyTranslations(p, translations.get(p.id))
  );

  return (
    <>
      {/* No `meta` prop: the hero's <dl> meta band was the sole structural
          difference from /key-dates and the ~80px of dead space under the
          navbar. Header now matches the key-dates reference exactly. */}
      <PatsPageHero
        eyebrow={a11n.eyebrow}
        title={a11n.title}
        subtitle={a11n.subtitle}
      />

      <PatsSection variant="navy">
        {announcements.length === 0 ? (
          <div className="pats-announce-empty">
            <p className="pats-body">{a11n.empty}</p>
          </div>
        ) : (
          <ScrollReveal>
            <div className="pats-announce-grid">
              {announcements.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/announcements/${a.slug}`}
                  className="pats-announce-card"
                >
                  <div className="pats-announce-card__media">
                    {a.imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/uploads/${a.imagePath}`}
                        alt={a.title}
                        loading={i < 3 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div
                        className="pats-announce-card__placeholder"
                        aria-hidden
                      >
                        PATS
                      </div>
                    )}
                    {/* Newest notice only. Overlaid on the thumbnail rather
                        than stacked in the body so it costs no extra height. */}
                    {i === 0 ? (
                      <span className="pats-announce-badge">{a11n.latest}</span>
                    ) : null}
                  </div>
                  <div className="pats-announce-card__body">
                    <span className="pats-announce-date">
                      <CalendarDays aria-hidden />
                      {formatDateLong(a.publishedAt, locale)}
                    </span>
                    <h2 className="pats-announce-card__title">{a.title}</h2>
                    <p className="pats-announce-card__excerpt">
                      {announcementExcerpt(a.content, 130)}
                    </p>
                    <span className="pats-announce-more">
                      {a11n.readMore}
                      <ArrowRight aria-hidden />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        )}
      </PatsSection>
    </>
  );
}
