"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminChartCardSkeleton } from "@/components/admin/AdminCrmSkeleton";
import type { RegistrationYearRow } from "@/lib/admin-dashboard-charts";

export function AdminRegistrationActivityChart({
  initialData,
}: {
  initialData: RegistrationYearRow[];
}) {
  const data = initialData;

  return (
    <div className="admin-crm-card admin-crm-card--chart">
      <div className="admin-crm-card-header">
        <h2 className="admin-crm-card-title">Registration Activity</h2>
        <span className="text-[0.8rem] font-semibold uppercase tracking-[0.04em] text-brand-ink-muted">
          By year
        </span>
      </div>

      {data.length === 0 ? (
        <div className="admin-crm-empty">
          <p>No data available</p>
        </div>
      ) : (
        <div className="admin-crm-chart-wrap">
          <svg
            width="0"
            height="0"
            aria-hidden
            className="admin-crm-chart-gradient-defs"
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4d6340" />
                <stop offset="100%" stopColor="#2f4025" />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{ fill: "#0f172a", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#0f172a", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(61, 82, 48, 0.08)" }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Bar
                dataKey="count"
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={64}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function AdminRegistrationActivityChartFallback() {
  return <AdminChartCardSkeleton />;
}
