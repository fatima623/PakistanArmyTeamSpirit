import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { isAdminNewsPdfReadable } from "@/lib/serve-admin-news-pdf";
import { formatDateShort } from "@/lib/utils";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { NewsPdfOpenLink } from "@/components/admin/NewsPdfOpenLink";
import { AdminUsersPagination } from "@/components/admin/AdminUsersPagination";
import { Button } from "@/components/ui/button";
import { adminUsersPagination } from "@/lib/admin-ui";
import { adminNavLabel } from "@/lib/admin-navigation";
import "@/app/admin-news-reference.css";
import "@/app/admin-users-reference.css";

export const metadata: Metadata = {
  title: adminNavLabel("news"),
};

const PAGE_SIZE = 20;

type SearchParams = Promise<{ page?: string }>;

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [posts, totalCount] = await Promise.all([
    prisma.newsPost.findMany({
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.newsPost.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
            <h2>News posts</h2>
            <p>Manage public announcements and PDF downloads for visitors.</p>
          </div>
          <Link href="/admin/news/new">
            <Button variant="adminPrimary">New post</Button>
          </Link>
        </header>

        {posts.length === 0 ? (
          <p className="admin-news-empty">
            No news posts yet. Create your first announcement.
          </p>
        ) : (
          <>
            <div className="admin-news-table-shell">
              <table className="admin-news-table">
                <colgroup>
                  <col className="admin-news-col-num" />
                  <col className="admin-news-col-title" />
                  <col className="admin-news-col-pdf" />
                  <col className="admin-news-col-date" />
                  <col className="admin-news-col-status" />
                  <col className="admin-news-col-actions" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Title</th>
                    <th scope="col">PDF</th>
                    <th scope="col">Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, i) => (
                    <tr key={post.id}>
                      <td className="admin-news-cell-num">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="admin-news-cell-title">
                        <div className="admin-news-title-cell">
                          <span className="admin-news-title-text">
                            {post.title}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-news-pdf-cell">
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
                          ) : (
                            <span className="admin-news-pdf-none">—</span>
                          )}
                        </div>
                      </td>
                      <td className="admin-news-cell-date">
                        {formatDateShort(post.publishedAt)}
                      </td>
                      <td>
                        <span
                          className={
                            post.published
                              ? "admin-news-published-label"
                              : "admin-news-draft-label"
                          }
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <footer className={adminUsersPagination}>
                <p className="admin-users-pagination-page">
                  Page {page} of {totalPages}
                </p>
                <AdminUsersPagination
                  page={page}
                  totalPages={totalPages}
                  filter="all"
                  search=""
                  basePath="/admin/news"
                />
              </footer>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
