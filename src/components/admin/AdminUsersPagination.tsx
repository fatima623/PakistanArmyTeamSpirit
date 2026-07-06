import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

function pageHref(
  basePath: string,
  page: number,
  filter: string,
  search: string
) {
  return `${basePath}?page=${page}&filter=${filter}&search=${encodeURIComponent(search)}`;
}

function visiblePages(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export function AdminUsersPagination({
  page,
  totalPages,
  filter,
  search,
  basePath = "/admin/users",
}: {
  page: number;
  totalPages: number;
  filter: string;
  search: string;
  basePath?: string;
}) {
  const pages = visiblePages(page, totalPages);

  return (
    <nav className="admin-users-page-nav" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={pageHref(basePath, page - 1, filter, search)}
          className="admin-users-page-btn admin-users-page-btn--icon"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span
          className="admin-users-page-btn admin-users-page-btn--icon admin-users-page-btn--disabled"
          aria-disabled="true"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </span>
      )}

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="inline-flex items-center gap-1.5">
            {showEllipsis ? (
              <span className="admin-users-page-ellipsis" aria-hidden>
                …
              </span>
            ) : null}
            <Link
              href={pageHref(basePath, p, filter, search)}
              className={cn(
                "admin-users-page-btn admin-users-page-num",
                p === page && "admin-users-page-num--active"
              )}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Link>
          </span>
        );
      })}

      {page < totalPages ? (
        <Link
          href={pageHref(basePath, page + 1, filter, search)}
          className="admin-users-page-btn admin-users-page-btn--icon"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span
          className="admin-users-page-btn admin-users-page-btn--icon admin-users-page-btn--disabled"
          aria-disabled="true"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
