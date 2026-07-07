"use client";

import { useCallback, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RefreshCw } from "lucide-react";

import { AdminChartCardSkeleton } from "@/components/admin/AdminCrmSkeleton";
import type {
  RegistrationMonthRow,
  RegistrationRangeKey,
} from "@/lib/admin-dashboard-charts";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: { key: RegistrationRangeKey; label: string }[] = [
  { key: "3m", label: "3M" },
  { key: "6m", label: "6M" },
  { key: "1y", label: "1Y" },
];

export function AdminRegistrationActivityChart({
  initialData,
}: {
  initialData: RegistrationMonthRow[];
}) {
  const [range, setRange] = useState<RegistrationRangeKey>("6m");
  const [data, setData] = useState<RegistrationMonthRow[]>(initialData);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (r: RegistrationRangeKey) => {
    setRefetching(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/registrations-by-month?range=${r}`);
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as { data: RegistrationMonthRow[] };
      setData(json.data ?? []);
    } catch {
      setError(true);
    } finally {
      setRefetching(false);
    }
  }, []);

  const onRangeChange = (next: RegistrationRangeKey) => {
    if (next === range) return;
    setRange(next);
    if (next === "6m") {
      setData(initialData);
      setError(false);
      return;
    }
    void load(next);
  };

  return (
    <div className="admin-crm-card admin-crm-card--chart">
      <div className="admin-crm-card-header">
        <h2 className="admin-crm-card-title">Registration Activity</h2>
        <div className="admin-crm-range-toggle" role="group" aria-label="Time range">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={cn(
                "admin-crm-range-btn",
                range === opt.key && "admin-crm-range-btn--active"
              )}
              onClick={() => onRangeChange(opt.key)}
              disabled={refetching}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="admin-crm-empty admin-crm-empty--error">
          <p>Failed to load data</p>
          <button
            type="button"
            className="admin-crm-retry-btn"
            onClick={() => void load(range)}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Retry
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="admin-crm-empty">
          <p>No data available</p>
        </div>
      ) : (
        <div
          className={cn(
            "admin-crm-chart-wrap",
            refetching && "admin-crm-chart-wrap--loading"
          )}
        >
          <svg width="0" height="0" aria-hidden className="admin-crm-chart-gradient-defs">
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4d6340" />
                <stop offset="100%" stopColor="#2f4025" />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
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
                maxBarSize={48}
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
