"use client";

import { CheckCircle2, Clock, CreditCard, Users } from "lucide-react";

import { AdminStatCard } from "@/components/admin/AdminStatCard";

const STAT_CONFIG = [
  {
    label: "Total participants",
    hint: "Registered across all units",
    key: "total" as const,
    tone: "mint" as const,
    variant: "feature" as const,
    Icon: Users,
    href: "/admin/users?filter=all",
  },
  {
    label: "Approved",
    hint: "Cleared for PATS 2026",
    key: "approved" as const,
    tone: "mint" as const,
    variant: "default" as const,
    Icon: CheckCircle2,
    href: "/admin/users?filter=approved",
  },
  {
    label: "Awaiting review",
    hint: "Applications pending",
    key: "pending" as const,
    tone: "amber" as const,
    variant: "default" as const,
    Icon: Clock,
    href: "/admin/users?filter=pending",
  },
  {
    label: "Payments to verify",
    hint: "Proofs submitted",
    key: "payments" as const,
    tone: "violet" as const,
    variant: "default" as const,
    Icon: CreditCard,
    href: "/admin/payments?status=SUBMITTED",
  },
] as const;

export type AdminDashboardStatsData = {
  total: number;
  approved: number;
  pending: number;
  payments: number;
};

export type AdminDashboardStatsSeries = Record<
  keyof AdminDashboardStatsData,
  number[]
>;

export function AdminDashboardStats({
  stats,
  series,
}: {
  stats: AdminDashboardStatsData;
  series?: AdminDashboardStatsSeries;
}) {
  return (
    <section aria-label="Dashboard statistics" className="admin-crm-stats">
      {STAT_CONFIG.map((cfg, index) => (
        <AdminStatCard
          key={cfg.key}
          label={cfg.label}
          value={stats[cfg.key]}
          icon={cfg.Icon}
          tone={cfg.tone}
          variant={cfg.variant}
          staggerIndex={index}
          href={cfg.href}
          series={series?.[cfg.key]}
        />
      ))}
    </section>
  );
}
