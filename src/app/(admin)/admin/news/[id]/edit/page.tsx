import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildTranslationSeed } from "@/lib/admin-translations";
import { prisma } from "@/lib/prisma";
import { NewsPostForm } from "@/components/admin/admin-dynamic";
import { adminNavLabel } from "@/lib/admin-navigation";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: adminNavLabel("news"),
};

export default async function AdminNewsEditPage({ params }: PageProps) {
  const { id } = await params;

  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) {
    notFound();
  }

  // Seeded here rather than fetched by the form: this editor is already a
  // server route, so the translations arrive with the first paint.
  const translations = await buildTranslationSeed("NewsPost", post.id, {
    title: post.title,
    content: post.content,
  });

  return (
      <NewsPostForm
        postId={post.id}
        initialTranslations={translations}
        initial={{
          title: post.title,
          slug: post.slug,
          content: post.content,
          publishedAt: post.publishedAt,
          expiresAt: post.expiresAt,
          published: post.published,
          hasImage: Boolean(post.imagePath),
          imagePath: post.imagePath,
        }}
      />
  );
}
