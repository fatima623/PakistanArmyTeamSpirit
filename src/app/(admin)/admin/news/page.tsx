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
import { adminTableActionsCenter, adminUsersPagination } from "@/lib/admin-ui";
import { adminNavLabel } from "@/lib/admin-navigation";
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
    <div className="pb-8">
      <div className="admin-surface flex flex-col gap-7 p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="[&>h2]:text-[1.75rem] [&>h2]:font-bold [&>h2]:tracking-[-0.01em] [&>h2]:text-brand-ink [&>p]:mt-1.5 [&>p]:max-w-[36rem] [&>p]:text-sm [&>p]:leading-normal [&>p]:text-muted-foreground">
            <h2>News posts</h2>
            <p>Manage public announcements and PDF downloads for visitors.</p>
          </div>
          <Link href="/admin/news/new">
            <Button variant="adminPrimary">New post</Button>
          </Link>
        </header>

        {posts.length === 0 ? (
          <p className="px-6 py-12 text-center text-muted-foreground">
            No news posts yet. Create your first announcement.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-[10px] border border-black/[0.06]">
              <table className="admin-data-table min-w-[36rem]">
                <colgroup>
                  <col className="w-[6%]" />
                  <col className="w-[32%]" />
                  <col className="w-[18%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[18%]" />
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
                      <td className="font-semibold tabular-nums text-muted-foreground">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td>
                        <div className="flex max-w-full flex-col items-center gap-1">
                          <span className="font-semibold leading-[1.4] text-brand-ink">
                            {post.title}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center">
                          {pdfReadableById.get(post.id) ? (
                            <NewsPdfOpenLink
                              postId={post.id}
                              fileName={post.pdfOriginalName}
                            />
                          ) : post.pdfPath ? (
                            <span
                              className="text-[0.8125rem] text-muted-foreground/70"
                              title="PDF record exists but file is missing on server — edit post to re-upload"
                            >
                              File missing
                            </span>
                          ) : (
                            <span className="text-[0.8125rem] text-muted-foreground/70">—</span>
                          )}
                        </div>
                      </td>
                      <td className="tabular-nums">
                        {formatDateShort(post.publishedAt)}
                      </td>
                      <td>
                        <span
                          className={
                            post.published
                              ? "inline-block rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.06em] text-green-800"
                              : "inline-block rounded bg-brand-parchment-2/60 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground"
                          }
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <div
                          className={adminTableActionsCenter}
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
