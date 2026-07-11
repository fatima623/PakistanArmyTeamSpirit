import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

function pageHref(
  basePath: string,
  page: number,
  filter: string,
  search: string,
  filterParam: string,
  extraQuery = ""
) {
  return `${basePath}?page=${page}&${filterParam}=${filter}&search=${encodeURIComponent(search)}${extraQuery ? `&${extraQuery}` : ""}`;
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
  filterParam = "filter",
  extraQuery = "",
}: {
  page: number;
  totalPages: number;
  filter: string;
  search: string;
  basePath?: string;
  filterParam?: string;
  /** Pre-encoded query-string tail preserved across page links (e.g. `payStatus=VERIFIED`). */
  extraQuery?: string;
}) {
  const pages = visiblePages(page, totalPages);

  return (
    <nav className="inline-flex flex-nowrap items-center gap-1.5" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={pageHref(basePath, page - 1, filter, search, filterParam, extraQuery)}
          className="inline-flex h-9 w-9 min-w-9 items-center justify-center rounded-lg border border-brand-line/60 bg-white p-0 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-brand-olive/30 hover:bg-slate-50 hover:text-green-800"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span
          className="inline-flex h-9 w-9 min-w-9 items-center justify-center rounded-lg border border-brand-line/60 bg-white p-0 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-brand-olive/30 hover:bg-slate-50 hover:text-green-800 cursor-not-allowed opacity-40 hover:border-brand-line/60 hover:bg-white hover:text-slate-900"
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
              <span className="px-1 text-sm text-slate-900/50" aria-hidden>
                …
              </span>
            ) : null}
            <Link
              href={pageHref(basePath, p, filter, search, filterParam, extraQuery)}
              className={cn(
                "inline-flex h-9 w-9 min-w-9 items-center justify-center rounded-lg border border-brand-line/60 bg-white p-0 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-brand-olive/30 hover:bg-slate-50 hover:text-green-800 text-sm font-semibold",
                p === page &&
                  "border-green-800 bg-green-800 text-white shadow-[0_2px_8px_rgba(22,101,52,0.3)] hover:border-green-900 hover:bg-green-900 hover:text-white"
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
          href={pageHref(basePath, page + 1, filter, search, filterParam, extraQuery)}
          className="inline-flex h-9 w-9 min-w-9 items-center justify-center rounded-lg border border-brand-line/60 bg-white p-0 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-brand-olive/30 hover:bg-slate-50 hover:text-green-800"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span
          className="inline-flex h-9 w-9 min-w-9 items-center justify-center rounded-lg border border-brand-line/60 bg-white p-0 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-brand-olive/30 hover:bg-slate-50 hover:text-green-800 cursor-not-allowed opacity-40 hover:border-brand-line/60 hover:bg-white hover:text-slate-900"
          aria-disabled="true"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
