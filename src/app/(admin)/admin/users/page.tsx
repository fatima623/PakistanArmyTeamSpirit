import type { Metadata } from "next";
import "@/app/admin-users-reference.css";
import Link from "next/link";
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
import { APPLICATION_STATUS } from "@/lib/constants";
import {
  adminFilterChip,
  adminFilterChipActive,
  adminFilterChipInactive,
  filterChipToneProps,
  adminUsersFilterTabs,
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

const FILTER_LABELS: Record<string, string> = {
  all: "All",
  pending: "Pending",
  approved: "Approved",
  rejected: "Referred",
  payment_pending: "Payment due",
};

type SearchParams = Promise<{
  page?: string;
  search?: string;
  filter?: string;
  appStatus?: string;
  payStatus?: string;
}>;

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
  const payStatus = params.payStatus ?? "";

  const where: Prisma.UserWhereInput = { role: { not: "admin" } };
  if (filter === "pending") {
    where.applicationStatus = APPLICATION_STATUS.PENDING;
  }
  if (filter === "approved") {
    where.applicationStatus = APPLICATION_STATUS.APPROVED;
  }
  if (filter === "rejected") {
    where.applicationStatus = APPLICATION_STATUS.REJECTED;
  }
  if (filter === "payment_pending") {
    where.applicationStatus = APPLICATION_STATUS.APPROVED;
    where.paymentStatus = "PENDING";
  }
  if (appStatus) where.applicationStatus = appStatus;
  if (payStatus) where.paymentStatus = payStatus;
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ];
  }

  const viewerRole = await getAdminRole();

  const [users, totalCount] = await Promise.all([
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
        country: true,
        nationality: true,
        unit: { select: { unitName: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

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
  const filters = [
    "all",
    "pending",
    "approved",
    "rejected",
    "payment_pending",
  ] as const;

  return (
      <div className={cn(adminUsersPage, "admin-fade-in-up")}>
        <div className={adminUsersPanel}>
          <section className={adminUsersControls}>
            <div className={adminUsersToolbarSearch}>
              <LiveSearchInput
                paramName="search"
                placeholder="Search name or email..."
                ariaLabel="Search users"
                className="admin-users-search-field"
                inputClassName="admin-input admin-users-search-input"
                iconClassName="admin-users-search-icon"
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
            <nav className={adminUsersFilterTabs} aria-label="Filter users">
              {filters.map((f) => (
                <Link
                  key={f}
                  href={`/admin/users?filter=${f}&search=${encodeURIComponent(search)}&page=1`}
                  {...filterChipToneProps(f)}
                  className={cn(
                    adminFilterChip,
                    filter === f
                      ? adminFilterChipActive
                      : adminFilterChipInactive
                  )}
                >
                  {FILTER_LABELS[f] ?? f}
                </Link>
              ))}
              <span className="admin-users-count-badge">
                {totalCount} {totalCount === 1 ? "request" : "requests"}
              </span>
            </nav>
          </section>

          <UsersManagementTable
            users={users}
            canApprove={canApproveRegistration(viewerRole)}
          />

          <footer className={adminUsersPagination}>
            <p className="admin-users-pagination-page">
              Page {page} of {totalPages}
            </p>
            <AdminUsersPagination
              page={page}
              totalPages={totalPages}
              filter={filter}
              search={search}
            />
          </footer>
        </div>
      </div>
  );
}
