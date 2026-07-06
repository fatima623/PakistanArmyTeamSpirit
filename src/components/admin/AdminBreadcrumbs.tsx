import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

/** Simple breadcrumb trail for admin detail pages. Last item is the current page. */
export function AdminBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-cp-ink-muted">
        {items.map((crumb, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="inline-flex items-center gap-1.5">
              {crumb.href && !last ? (
                <Link href={crumb.href} className="admin-link">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={last ? "font-semibold text-cp-ink" : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
              {!last ? (
                <ChevronRight
                  className="h-3.5 w-3.5 text-slate-400"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
