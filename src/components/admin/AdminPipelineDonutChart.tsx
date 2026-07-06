"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { PipelineStatusRow } from "@/lib/admin-dashboard-charts";
import { APPLICATION_STATUS } from "@/lib/constants";

const COLORS: Record<string, string> = {
  [APPLICATION_STATUS.APPROVED]: "#10b981",
  [APPLICATION_STATUS.PENDING]: "#6366f1",
  [APPLICATION_STATUS.REJECTED]: "#f43f5e",
};

const DEFAULT_COLOR = "#3b82f6";

export function AdminPipelineDonutChart({
  initialRows,
  initialTotal,
}: {
  initialRows: PipelineStatusRow[];
  initialTotal: number;
}) {
  const chartData = initialRows.filter((r) => r.count > 0);

  return (
    <div className="admin-crm-card admin-crm-card--chart">
      <h2 className="admin-crm-card-title admin-crm-card-title--solo">
        Registration Pipeline
      </h2>

      {chartData.length === 0 ? (
        <div className="admin-crm-empty">
          <p>No data available</p>
        </div>
      ) : (
        <div className="admin-crm-pipeline">
          <div className="admin-crm-pipeline-chart">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={2}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.statusKey}
                      fill={COLORS[entry.statusKey] ?? DEFAULT_COLOR}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="admin-crm-pipeline-center" aria-hidden>
              <span className="admin-crm-pipeline-total">{initialTotal}</span>
              <span className="admin-crm-pipeline-total-label">Total</span>
            </div>
          </div>
          <ul className="admin-crm-pipeline-legend">
            {initialRows.map((row) => (
              <li key={row.statusKey}>
                <span
                  className="admin-crm-pipeline-swatch"
                  style={{
                    background: COLORS[row.statusKey] ?? DEFAULT_COLOR,
                  }}
                  aria-hidden
                />
                <span className="admin-crm-pipeline-legend-label">{row.status}</span>
                <span className="admin-crm-pipeline-legend-count">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
