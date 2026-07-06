import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { isAdminNewsPdfReadable } from "@/lib/serve-admin-news-pdf";
import { formatDateShort } from "@/lib/utils";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { NewsPdfOpenLink } from "@/components/admin/NewsPdfOpenLink";
import { Button } from "@/components/ui/button";
import { adminNavLabel } from "@/lib/admin-navigation";
import "@/app/admin-news-reference.css";

export const metadata: Metadata = {
  title: adminNavLabel("news"),
};

export default async function AdminNewsPage() {
  const posts = await prisma.newsPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  const pdfReadableById = new Map(
    await Promise.all(
      posts.map(async (post) => [
        post.id,
        post.pdfPath
          ? await isAdminNewsPdfReadable(post.id, post.pdfPath)
          : false,
      ] as const)
    )
  );

  return (
      <div className="admin-news-page">
        <div className="admin-news-panel">
          <header className="admin-news-header">
            <div className="admin-news-header-text">
              <h2>News posts ({posts.length})</h2>
              <p>
                Manage public announcements and PDF downloads for visitors.
              </p>
            </div>
            <Link href="/admin/news/new">
              <Button variant="adminPrimary">New post</Button>
            </Link>
          </header>

          {posts.length === 0 ? (
            <p className="admin-team-empty">
              No news posts yet. Create your first announcement.
            </p>
          ) : (
            <ul className="admin-news-list">
              {posts.map((post) => (
                <li key={post.id}>
                  <div className="admin-news-row">
                    <span className="admin-news-row__icon" aria-hidden>
                      <Newspaper className="h-4 w-4" />
                    </span>
                    <div className="admin-news-row__main">
                      <div className="admin-news-row__title">{post.title}</div>
                      <div className="admin-news-row__meta">
                        <span>{formatDateShort(post.publishedAt)}</span>
                        {pdfReadableById.get(post.id) ? (
                          <NewsPdfOpenLink
                            postId={post.id}
                            fileName={post.pdfOriginalName}
                          />
                        ) : post.pdfPath ? (
                          <span
                            className="admin-news-pdf-none"
                            title="PDF record exists but file is missing on server — edit post to re-upload"
                          >
                            File missing
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="admin-news-row__aside">
                      <span
                        className={`admin-news-status admin-news-status--${
                          post.published ? "published" : "draft"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                      <div
                        className="admin-news-row-actions"
                        role="group"
                        aria-label="Post actions"
                      >
                        <Button
                          size="sm"
                          variant="adminOutline"
                          className="portal-table-action-btn portal-table-action-btn--view portal-table-action-btn--icon"
                          asChild
                        >
                          <Link
                            href={`/admin/news/${post.id}/edit`}
                            aria-label="Edit post"
                            title="Edit post"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </Link>
                        </Button>
                        <DeletePostButton postId={post.id} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
  );
}
