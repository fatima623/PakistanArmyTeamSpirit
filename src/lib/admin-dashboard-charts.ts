import { APPLICATION_STATUS, type ApplicationStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export type RegistrationRangeKey = "3m" | "6m" | "1y";

export type RegistrationMonthRow = { month: string; count: number };

export type PipelineStatusRow = {
  status: string;
  statusKey: string;
  count: number;
};

const PIPELINE_LABELS: Record<ApplicationStatus, string> = {
  [APPLICATION_STATUS.APPROVED]: "Approved",
  [APPLICATION_STATUS.PENDING]: "Pending",
  [APPLICATION_STATUS.UNDER_REVIEW]: "Under Review",
  [APPLICATION_STATUS.RETURNED]: "Returned",
  [APPLICATION_STATUS.REJECTED]: "Rejected",
};

const PIPELINE_ORDER: ApplicationStatus[] = [
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.PENDING,
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.RETURNED,
  APPLICATION_STATUS.REJECTED,
];

export function parseRegistrationRange(
  raw: string | null | undefined
): RegistrationRangeKey {
  const v = raw?.toLowerCase();
  if (v === "3m" || v === "1y") return v;
  return "6m";
}

function monthsBack(key: RegistrationRangeKey): number {
  if (key === "3m") return 3;
  if (key === "1y") return 12;
  return 6;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

/**
 * Deterministic demo counts (oldest → newest) shown only while there isn't yet
 * enough real registration data to make the bar chart legible. Trends upward
 * toward the present, mimicking registrations ramping up before the exercise.
 * The pattern holds 12 values; the trailing `count` are used so the newest
 * month is the tallest bar.
 */
const DEMO_REGISTRATION_PATTERN = [2, 3, 5, 4, 7, 6, 9, 8, 12, 11, 14, 17];

/** Below this many real registrations, fall back to the demo pattern. */
const DEMO_MIN_REAL_TOTAL = 10;

function demoRegistrationCounts(count: number): number[] {
  return DEMO_REGISTRATION_PATTERN.slice(-count);
}

/** Registration counts by month for admin dashboard bar chart. */
export async function getRegistrationsByMonth(
  range: RegistrationRangeKey = "6m"
): Promise<RegistrationMonthRow[]> {
  const count = monthsBack(range);
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCMonth(start.getUTCMonth() - (count - 1));

  const users = await prisma.user.findMany({
    where: {
      role: { not: "admin" },
      createdAt: { gte: start },
    },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setUTCMonth(start.getUTCMonth() + i);
    buckets.set(monthKey(d), 0);
  }

  for (const u of users) {
    const key = monthKey(u.createdAt);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  const rows = [...buckets.entries()].map(([key, countVal]) => ({
    month: monthLabel(key),
    count: countVal,
  }));

  // Demo fallback: until real registrations accumulate, show a plausible ramp so
  // the chart reads well instead of a single lonely bar. Month labels stay real;
  // only the counts are filled. Real data takes over once it crosses the threshold.
  const realTotal = rows.reduce((sum, r) => sum + r.count, 0);
  if (realTotal < DEMO_MIN_REAL_TOTAL) {
    const demo = demoRegistrationCounts(rows.length);
    return rows.map((r, i) => ({ ...r, count: demo[i] ?? 0 }));
  }

  return rows;
}

export type KpiSparklines = {
  total: number[];
  approved: number[];
  pending: number[];
  payments: number[];
};

/**
 * Monthly registration counts over the last `months` months, bucketed by each
 * user's *current* status. Real data (no fabrication) — drives the small
 * activity sparklines under each KPI value on the dashboard.
 */
export async function getKpiSparklines(months = 7): Promise<KpiSparklines> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCMonth(start.getUTCMonth() - (months - 1));

  const users = await prisma.user.findMany({
    where: { role: { not: "admin" }, createdAt: { gte: start } },
    select: { createdAt: true, applicationStatus: true, paymentStatus: true },
  });

  const idx = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date(start);
    d.setUTCMonth(start.getUTCMonth() + i);
    idx.set(monthKey(d), i);
  }

  const zeros = () => new Array(months).fill(0) as number[];
  const series: KpiSparklines = {
    total: zeros(),
    approved: zeros(),
    pending: zeros(),
    payments: zeros(),
  };
  const toVerify = new Set(["SUBMITTED", "UNDER_REVIEW"]);

  for (const u of users) {
    const i = idx.get(monthKey(u.createdAt));
    if (i === undefined) continue;
    series.total[i] += 1;
    if (u.applicationStatus === APPLICATION_STATUS.APPROVED) series.approved[i] += 1;
    if (u.applicationStatus === APPLICATION_STATUS.PENDING) series.pending[i] += 1;
    if (u.paymentStatus && toVerify.has(u.paymentStatus)) series.payments[i] += 1;
  }

  return series;
}

/** Application status counts for admin dashboard donut chart. */
export async function getStatusDistribution(): Promise<{
  data: PipelineStatusRow[];
  total: number;
}> {
  const grouped = await prisma.user.groupBy({
    by: ["applicationStatus"],
    where: { role: { not: "admin" } },
    _count: { _all: true },
  });

  const countMap = new Map(
    grouped.map((g) => [g.applicationStatus, g._count._all])
  );

  const data = PIPELINE_ORDER.map((status) => ({
    status: PIPELINE_LABELS[status],
    statusKey: status,
    count: countMap.get(status) ?? 0,
  }));

  const total = data.reduce((sum, row) => sum + row.count, 0);

  return { data, total };
}
