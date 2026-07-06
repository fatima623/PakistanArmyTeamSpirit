"use client";

import type {
  PipelineStatusRow,
  RegistrationMonthRow,
} from "@/lib/admin-dashboard-charts";

import { AdminPipelineDonutChart } from "@/components/admin/AdminPipelineDonutChart";
import { AdminRegistrationActivityChart } from "@/components/admin/AdminRegistrationActivityChart";

export type AdminDashboardChartsProps = {
  initialRegistrationActivity: RegistrationMonthRow[];
  initialPipeline: PipelineStatusRow[];
  initialPipelineTotal: number;
};

export function AdminDashboardCharts({
  initialRegistrationActivity,
  initialPipeline,
  initialPipelineTotal,
}: AdminDashboardChartsProps) {
  return (
    <section
      aria-label="Registration analytics"
      className="admin-crm-charts-row admin-fade-in-up admin-fade-in-up--delay-4"
    >
      <AdminRegistrationActivityChart
        initialData={initialRegistrationActivity}
      />
      <AdminPipelineDonutChart
        initialRows={initialPipeline}
        initialTotal={initialPipelineTotal}
      />
    </section>
  );
}
