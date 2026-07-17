import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { announcementExcerpt } from "@/lib/announcement-excerpt";
import {
  applyTranslations,
  getTranslationsFor,
} from "@/lib/i18n/content-translations";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { getNewsPostBySlug } from "@/lib/site-data";
import { formatDateLong } from "@/lib/utils";

/** Match the list page: the detail route is statically rendered, so without
 *  this it served stale HTML indefinitely after an admin edit. */
export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // The slug is the lookup key and is NEVER translated — only the rendered
  // title/content are.
  const { slug } = await params;
  const [source, { locale }] = await Promise.all([
    getNewsPostBySlug(slug),
    getDictionary(),
  ]);
  if (!source) return {};
  const post = applyTranslations(
    source,
    await getTranslationsFor("NewsPost", source.id, locale)
  );
  return {
    title: post.title,
    // Shared helper: the inline strip here left `&amp;`/`&nbsp;` leaking into
    // the meta + OpenGraph description.
    description: announcementExcerpt(post.content, 160),
    ...(post.imagePath
      ? { openGraph: { images: [`/uploads/${post.imagePath}`] } }
      : {}),
  };
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [source, { t, locale }] = await Promise.all([
    getNewsPostBySlug(slug),
    getDictionary(),
  ]);

  if (!source) {
    notFound();
  }

  // Translated title/content layered over the English source. The slug is
  // untouched: the route already resolved by it, and translating it would 404.
  const post = applyTranslations(
    source,
    await getTranslationsFor("NewsPost", source.id, locale)
  );

  const a11n = t.publicSite.announcements;
  // Sanitised server-side (sanitize-html): p/br/strong/em/h2/h3/ul/ol/li/a
  // only, every <a> forced to target=_blank rel=noopener.
  //
  // SECURITY: `post.content` may now be an ADMIN-SUPPLIED TRANSLATION, which is
  // untrusted HTML exactly like the English source. It goes through the SAME
  // sanitizeNewsContent() call on the identical code path — the translation is
  // substituted upstream of this line, so there is no second, unsanitized
  // dangerouslySetInnerHTML route into the DOM.
  const safeContent = sanitizeNewsContent(post.content);

  return (
    <>
      <PatsPageHero eyebrow={a11n.eyebrow} title={post.title} />
      <PatsSection variant="navy">
        <ScrollReveal>
          <article className="pats-prose-panel pats-announce-article">
            <p className="pats-announce-date pats-announce-article__date">
              <CalendarDays aria-hidden />
              {formatDateLong(post.publishedAt, locale)}
            </p>

            {post.imagePath ? (
              <div className="pats-announcement-detail__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/uploads/${post.imagePath}`} alt={post.title} />
              </div>
            ) : null}

            <div
              className="cinematic-prose pats-body pats-announce-article__body"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />

            {post.pdfPath ? (
              <p className="pats-announce-article__pdf">
                <a
                  href={`/api/news-pdf/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pats-btn inline-flex"
                >
                  {a11n.downloadPdf}
                  {post.pdfOriginalName ? (
                    <span className="ml-2 font-normal opacity-70">
                      ({post.pdfOriginalName})
                    </span>
                  ) : null}
                </a>
              </p>
            ) : null}

            <div className="pats-announce-article__foot">
              <Link href="/announcements" className="pats-announce-back">
                <ArrowLeft aria-hidden />
                {a11n.backToList}
              </Link>
            </div>
          </article>
        </ScrollReveal>
      </PatsSection>
    </>
  );
}
