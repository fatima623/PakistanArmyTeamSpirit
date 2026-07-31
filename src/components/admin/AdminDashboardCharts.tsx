"use client";

import type {
  PipelineStatusRow,
  RegistrationCountryRow,
  RegistrationYearRow,
} from "@/lib/admin-dashboard-charts";

import { AdminPipelineDonutChart } from "@/components/admin/AdminPipelineDonutChart";
import { AdminRegistrationActivityChart } from "@/components/admin/AdminRegistrationActivityChart";
import { AdminRegistrationCountryChart } from "@/components/admin/AdminRegistrationCountryChart";

export type AdminDashboardChartsProps = {
  initialRegistrationActivity: RegistrationYearRow[];
  initialRegistrationCountry: RegistrationCountryRow[];
  initialPipeline: PipelineStatusRow[];
  initialPipelineTotal: number;
};

export function AdminDashboardCharts({
  initialRegistrationActivity,
  initialRegistrationCountry,
  initialPipeline,
  initialPipelineTotal,
}: AdminDashboardChartsProps) {
  return (
    <>
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
      <section
        aria-label="Registrations by country"
        className="mt-4 admin-fade-in-up admin-fade-in-up--delay-5"
      >
        <AdminRegistrationCountryChart data={initialRegistrationCountry} />
      </section>
    </>
  );
}
