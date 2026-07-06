import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { getNewsPostBySlug } from "@/lib/site-data";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { formatDateLong } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.content.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const safeContent = sanitizeNewsContent(post.content);

  return (
    <>
      <PatsPageHero eyebrow="News" title={post.title} />
      <PatsSection variant="navy">
        <div className="pats-prose-panel">
          <p className="pats-eyebrow !mb-6">{formatDateLong(post.publishedAt)}</p>
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
                Download PDF
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
    </>
  );
}
