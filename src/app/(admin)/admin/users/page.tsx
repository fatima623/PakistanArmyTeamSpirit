import type { Metadata } from "next";
import Link from "next/link";
import { Users2 } from "lucide-react";
import { Prisma } from "@prisma/client";

import { AdminExportButton } from "@/components/admin/AdminExportButton";
import { AdminUsersPagination } from "@/components/admin/AdminUsersPagination";
import { LiveSearchInput } from "@/components/admin/LiveSearchInput";
import { UsersManagementTable } from "@/components/admin/UsersManagementTable";
import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/admin-session";
import { canApproveRegistration } from "@/lib/auth-routes";
import { cn } from "@/lib/utils";
import { adminNavLabel } from "@/lib/admin-navigation";
import {
  APPLICATION_STATUS,
  LEGACY_PAYMENT_STATUS,
  PAYMENT_STATUS,
  type ApplicationStatus,
} from "@/lib/constants";
import { normalizeApplicationStatus } from "@/lib/user-status";
import {
  segmentedChipClasses,
  adminUsersControls,
  adminUsersPage,
  adminUsersPagination,
  adminUsersPanel,
  adminUsersToolbarSearch,
} from "@/lib/admin-ui";

export const metadata: Metadata = {
  title: adminNavLabel("users"),
};

const PAGE_SIZE = 20;

/** Overall-status chips — reference design: All / Approved / Under Review /
 *  Returned / Rejected (Pending appears only while pending rows exist). */
const STATUS_FILTERS: {
  key: string;
  label: string;
  status?: ApplicationStatus;
}[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved", status: APPLICATION_STATUS.APPROVED },
  {
    key: "under_review",
    label: "Under Review",
    status: APPLICATION_STATUS.UNDER_REVIEW,
  },
  { key: "returned", label: "Returned", status: APPLICATION_STATUS.RETURNED },
  { key: "rejected", label: "Rejected", status: APPLICATION_STATUS.REJECTED },
];

type SearchParams = Promise<{
  page?: string;
  search?: string;
  filter?: string;
  appStatus?: string;
  payStatus?: string;
}>;

function buildHref(params: {
  filter: string;
  search: string;
  payStatus: string;
  page?: number;
}): string {
  const query = new URLSearchParams();
  if (params.filter && params.filter !== "all") query.set("filter", params.filter);
  if (params.search) query.set("search", params.search);
  if (params.payStatus && params.payStatus !== "all")
    query.set("payStatus", params.payStatus);
  query.set("page", String(params.page ?? 1));
  return `/admin/users?${query.toString()}`;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.search ?? "";
  const filter = params.filter ?? "all";
  const appStatus = params.appStatus ?? "";
  const payStatus = params.payStatus ?? "all";

  /* Base scope: everything except the status chip itself — the chip counts
     are computed against this same scope so the numbers always match. */
  const baseWhere: Prisma.UserWhereInput = { role: { not: "admin" } };
  if (search) {
    baseWhere.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ];
  }
  if (payStatus && payStatus !== "all") {
    baseWhere.paymentStatus =
      payStatus === PAYMENT_STATUS.VERIFIED
        ? { in: [PAYMENT_STATUS.VERIFIED, LEGACY_PAYMENT_STATUS.APPROVED] }
        : payStatus;
  }

  const where: Prisma.UserWhereInput = { ...baseWhere };

  const statusByFilter: Record<string, ApplicationStatus> = {
    approved: APPLICATION_STATUS.APPROVED,
    under_review: APPLICATION_STATUS.UNDER_REVIEW,
    returned: APPLICATION_STATUS.RETURNED,
    rejected: APPLICATION_STATUS.REJECTED,
    pending: APPLICATION_STATUS.PENDING,
  };
  if (statusByFilter[filter]) {
    where.applicationStatus = statusByFilter[filter];
  } else if (filter === "payment_pending") {
    // Legacy bookmark support
    where.applicationStatus = APPLICATION_STATUS.APPROVED;
    where.paymentStatus = PAYMENT_STATUS.PENDING;
  }
  if (appStatus) where.applicationStatus = appStatus;

  const viewerRole = await getAdminRole();

  const [users, totalCount, grouped] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        rank: true,
        role: true,
        approved: true,
        applicationStatus: true,
        paymentStatus: true,
        suspended: true,
        createdAt: true,
        approvedAt: true,
        rejectedAt: true,
        country: true,
        nationality: true,
        unit: { select: { unitName: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({
      by: ["applicationStatus"],
      where: baseWhere,
      _count: { _all: true },
    }),
  ]);

  /* Chip counts (normalised so legacy status strings still tally). */
  const statusCounts: Record<ApplicationStatus, number> = {
    PENDING: 0,
    UNDER_REVIEW: 0,
    APPROVED: 0,
    REJECTED: 0,
    RETURNED: 0,
  };
  let allCount = 0;
  for (const group of grouped) {
    const count = group._count._all;
    statusCounts[normalizeApplicationStatus(group.applicationStatus)] += count;
    allCount += count;
  }

  /* Chip row is fixed to the five reference statuses — pending rows stay
     reachable through the “All” chip. */
  const chips = STATUS_FILTERS;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const exportRows = users.map((u) => ({
    Name: `${u.firstName} ${u.lastName}`,
    Email: u.email,
    Rank: u.rank || "",
    Unit: u.unit?.unitName ?? "",
    Country: u.country ?? "",
    Application: u.applicationStatus,
    Payment: u.paymentStatus,
    Registered: u.createdAt.toISOString().slice(0, 10),
  }));

  const paginationExtraQuery =
    payStatus && payStatus !== "all"
      ? `payStatus=${encodeURIComponent(payStatus)}`
      : "";

  return (
      <div className={cn(adminUsersPage, "admin-fade-in-up")}>
        <div className={adminUsersPanel}>
          <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b border-brand-line/60 pb-3">
            <h2 className="m-0 flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900">
              <Users2
                size={17}
                className="flex-shrink-0 text-green-800"
                aria-hidden
              />
              Participation Requests
            </h2>

            <div className="flex flex-wrap items-center gap-1.5">
              <nav
                className="flex flex-wrap items-center gap-1.5"
                aria-label="Filter by overall status"
              >
                {chips.map((chip) => {
                  const count = chip.status
                    ? statusCounts[chip.status]
                    : allCount;
                  const active = filter === chip.key;
                  return (
                    <Link
                      key={chip.key}
                      href={buildHref({ filter: chip.key, search, payStatus })}
                      className={segmentedChipClasses(chip.key, active)}
                      aria-current={active ? "true" : undefined}
                    >
                      {chip.label} ({count})
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <section className={adminUsersControls}>
            <div className={adminUsersToolbarSearch}>
              <LiveSearchInput
                paramName="search"
                placeholder="Search name or email..."
                ariaLabel="Search users"
                className="relative min-w-0"
                inputClassName="h-11 w-full rounded-[10px] bg-white pl-10 pr-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-900/40 focus-visible:border-brand-olive/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-olive/15 focus-visible:ring-offset-0"
                iconClassName="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-900 opacity-45"
              />
              <AdminExportButton
                rows={exportRows}
                columns={[
                  "Name",
                  "Email",
                  "Rank",
                  "Unit",
                  "Country",
                  "Application",
                  "Payment",
                  "Registered",
                ]}
                filename="participation-requests.csv"
              />
            </div>
          </section>

          <UsersManagementTable
            users={users}
            canApprove={canApproveRegistration(viewerRole)}
          />

          <footer className={adminUsersPagination}>
            <p className="m-0 text-sm font-medium text-slate-900">
              Page {page} of {totalPages}
              <span className="text-slate-500"> · {totalCount} requests</span>
            </p>
            <AdminUsersPagination
              page={page}
              totalPages={totalPages}
              filter={filter}
              search={search}
              extraQuery={paginationExtraQuery}
            />
          </footer>
        </div>
      </div>
  );
}
