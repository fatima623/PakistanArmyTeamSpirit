"use client";

import type { RegistrationCountryRow } from "@/lib/admin-dashboard-charts";

/**
 * Country-wise registration statistics from real DB records. A compact ranked
 * bar list (no chart lib) that fills the dashboard's full width beneath the
 * activity + pipeline row.
 */
export function AdminRegistrationCountryChart({
  data,
}: {
  data: RegistrationCountryRow[];
}) {
  const max = data.reduce((m, r) => Math.max(m, r.count), 0) || 1;
  const total = data.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="admin-crm-card admin-crm-card--chart">
      <div className="admin-crm-card-header">
        <h2 className="admin-crm-card-title">Registrations by Country</h2>
        <span className="text-[0.8rem] font-semibold text-brand-ink-muted">
          {total} total
        </span>
      </div>

      {data.length === 0 ? (
        <div className="admin-crm-empty">
          <p>No data available</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5 pt-1">
          {data.map((row) => (
            <li key={row.country} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-[0.82rem] font-medium text-brand-ink">
                {row.country}
              </span>
              <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-brand-parchment-2">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-brand-olive"
                  style={{ width: `${Math.max(6, (row.count / max) * 100)}%` }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-[0.82rem] font-bold tabular-nums text-brand-ink">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
