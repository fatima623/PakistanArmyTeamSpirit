import type { LucideIcon } from "lucide-react";

/**
 * Sleek, on-theme empty state — olive-tinted icon badge, title and optional
 * description inside a soft card. Shared across admin list pages.
 */
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="admin-empty-state">
      <span className="admin-empty-state-icon" aria-hidden>
        <Icon />
      </span>
      <p className="admin-empty-state-title">{title}</p>
      {description ? (
        <p className="admin-empty-state-desc">{description}</p>
      ) : null}
    </div>
  );
}
