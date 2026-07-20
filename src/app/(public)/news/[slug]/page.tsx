import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { getNewsPostBySlug } from "@/lib/site-data";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { formatDateLong } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  applyTranslations,
  getTranslationsFor,
} from "@/lib/i18n/content-translations";

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
    description: post.content.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [source, { t, locale, dir }] = await Promise.all([
    getNewsPostBySlug(slug),
    getDictionary(),
  ]);

  if (!source) {
    notFound();
  }

  // Translated title/content layered over the English source (admin-supplied
  // per-locale). The slug is untouched — the route already resolved by it.
  const post = applyTranslations(
    source,
    await getTranslationsFor("NewsPost", source.id, locale)
  );

  const N = t.publicSite.news;
  // SECURITY: `post.content` may be an ADMIN-SUPPLIED TRANSLATION — untrusted
  // HTML exactly like the English source. It goes through the SAME
  // sanitizeNewsContent() call, so the translation is sanitized on the identical
  // code path with no second dangerouslySetInnerHTML route into the DOM.
  const safeContent = sanitizeNewsContent(post.content);

  return (
    <div lang={locale} dir={dir}>
      <PatsPageHero eyebrow={N.eyebrow} title={post.title} />
      <PatsSection variant="navy">
        <div className="pats-prose-panel">
          <p className="pats-eyebrow !mb-6">{formatDateLong(post.publishedAt, locale)}</p>
          <div
            className="cinematic-prose pats-body space-y-4"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
          {post.pdfPath ? (
            <p className="mt-8">
              <a
                href={`/api/news-pdf/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pats-btn inline-flex"
              >
                {N.downloadPdf}
                {post.pdfOriginalName ? (
                  <span className="ml-2 font-normal opacity-70">
                    ({post.pdfOriginalName})
                  </span>
                ) : null}
              </a>
            </p>
          ) : null}
        </div>
      </PatsSection>
    </div>
  );
}
