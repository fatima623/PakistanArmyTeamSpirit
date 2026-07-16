import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAnnouncements } from "@/lib/site-data";
import { formatDateLong } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Announcements",
  description:
    "Latest announcements and updates for the Pakistan Army Team Spirit (PATS) competition.",
};

/** Strip stored HTML down to a plain-text excerpt. */
function excerptOf(html: string, max: number): string {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}

export default async function AnnouncementsPage() {
  const [announcements, { t }] = await Promise.all([
    getAnnouncements(),
    getDictionary(),
  ]);
  const a11n = t.publicSite.announcements;
  const [lead, ...rest] = announcements;

  return (
    <>
      <PatsPageHero
        eyebrow={a11n.eyebrow}
        title={a11n.title}
        subtitle={a11n.subtitle}
        meta={
          announcements.length > 0
            ? [
                { label: a11n.latest, value: formatDateLong(lead.publishedAt) },
                {
                  label: a11n.title,
                  value: a11n.countLabel(announcements.length),
                },
              ]
            : []
        }
      />

      <PatsSection variant="navy">
        {announcements.length === 0 ? (
          <div className="pats-announce-empty">
            <p className="pats-body">{a11n.empty}</p>
          </div>
        ) : (
          <div className="pats-announce-layout">
            {/* Lead notice — full-width feature so the page opens with content
                instead of a band of empty space. */}
            <Link
              href={`/announcements/${lead.slug}`}
              className="pats-announce-lead"
            >
              <div className="pats-announce-lead__media">
                {lead.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/uploads/${lead.imagePath}`}
                    alt={lead.title}
                    loading="eager"
                  />
                ) : (
                  <div className="pats-announce-lead__placeholder" aria-hidden>
                    PATS
                  </div>
                )}
              </div>
              <div className="pats-announce-lead__body">
                <span className="pats-announce-badge">{a11n.latest}</span>
                <h2 className="pats-announce-lead__title">{lead.title}</h2>
                <p className="pats-announce-lead__excerpt">
                  {excerptOf(lead.content, 260)}
                </p>
                <div className="pats-announce-lead__foot">
                  <span className="pats-announce-date">
                    <CalendarDays aria-hidden />
                    {formatDateLong(lead.publishedAt)}
                  </span>
                  <span className="pats-announce-more">
                    {a11n.readMore}
                    <ArrowRight aria-hidden />
                  </span>
                </div>
              </div>
            </Link>

            {rest.length > 0 ? (
              <div className="pats-announce-grid">
                {rest.map((a) => (
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
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="pats-announce-card__placeholder"
                          aria-hidden
                        >
                          PATS
                        </div>
                      )}
                    </div>
                    <div className="pats-announce-card__body">
                      <span className="pats-announce-date">
                        <CalendarDays aria-hidden />
                        {formatDateLong(a.publishedAt)}
                      </span>
                      <h3 className="pats-announce-card__title">{a.title}</h3>
                      <p className="pats-announce-card__excerpt">
                        {excerptOf(a.content, 130)}
                      </p>
                      <span className="pats-announce-more">
                        {a11n.readMore}
                        <ArrowRight aria-hidden />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </PatsSection>
    </>
  );
}
