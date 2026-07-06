import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export function AdminCrmSkeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("admin-crm-skeleton", className)}
      style={style}
      aria-hidden
    />
  );
}

export function AdminChartCardSkeleton() {
  return (
    <div className="admin-crm-card admin-crm-card--chart">
      <div className="admin-crm-card-header">
        <AdminCrmSkeleton className="h-5 w-40" />
        <AdminCrmSkeleton className="h-8 w-28 rounded-lg" />
      </div>
      <AdminCrmSkeleton className="mt-6 h-[220px] w-full rounded-lg" />
    </div>
  );
}
