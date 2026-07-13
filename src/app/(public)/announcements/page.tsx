import type { Metadata } from "next";
import Link from "next/link";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { getAnnouncements } from "@/lib/site-data";
import { formatDateLong } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Announcements",
  description:
    "Latest announcements and updates for the Pakistan Army Team Spirit (PATS) competition.",
};

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <>
      <PatsPageHero eyebrow="Notices" title="Announcements" />
      <PatsSection variant="navy">
        {announcements.length === 0 ? (
          <p className="pats-body text-center">
            No announcements yet — please check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((a) => {
              const plain = a.content.replace(/<[^>]+>/g, "").trim();
              const excerpt = plain.slice(0, 140);
              return (
                <Link
                  key={a.id}
                  href={`/announcements/${a.slug}`}
                  className="pats-announcement-card"
                >
                  <div className="pats-announcement-card__media">
                    {a.imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/uploads/${a.imagePath}`}
                        alt={a.title}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="pats-announcement-card__placeholder"
                        aria-hidden
                      >
                        PATS
                      </div>
                    )}
                  </div>
                  <div className="pats-announcement-card__body">
                    <p className="pats-eyebrow">
                      {formatDateLong(a.publishedAt)}
                    </p>
                    <h3 className="pats-announcement-card__title">{a.title}</h3>
                    <p className="pats-announcement-card__excerpt">
                      {excerpt}
                      {plain.length > 140 ? "…" : ""}
                    </p>
                    <span className="pats-announcement-card__more">
                      Read more →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PatsSection>
    </>
  );
}
