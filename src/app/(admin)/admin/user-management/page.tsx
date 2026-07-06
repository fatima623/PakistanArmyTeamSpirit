import type { Metadata } from "next";
import "@/app/admin-users-reference.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { AdminUsersPagination } from "@/components/admin/AdminUsersPagination";
import { LiveSearchInput } from "@/components/admin/LiveSearchInput";
import { UserAccountsTable } from "@/components/admin/UserAccountsTable";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  adminUsersControls,
  adminUsersPage,
  adminUsersPagination,
  adminUsersPanel,
  adminUsersToolbarSearch,
} from "@/lib/admin-ui";
import { Button } from "@/components/ui/button";
import { getAdminRole } from "@/lib/admin-session";
import { canManageSystem } from "@/lib/auth-routes";

export const metadata: Metadata = {
  title: "User Management",
};

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  page?: string;
  search?: string;
}>;

export default async function AdminUserManagementPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Creating and managing accounts (incl. staff) is full-admin only.
  const role = await getAdminRole();
  if (!canManageSystem(role)) {
    redirect("/admin/users");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.search ?? "";

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ];
  }

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
        createdAt: true,
        suspended: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className={cn(adminUsersPage, "admin-fade-in-up")}>
      <div className={adminUsersPanel}>
        <header className="admin-users-page-header flex items-start justify-between gap-4">
          <div className="admin-users-page-intro min-w-0">
            <h2 className="admin-users-panel-title">Accounts &amp; roles</h2>
            <p className="admin-users-page-desc">
              Manage staff roles, access levels, and account status.
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            <span className="admin-users-count-badge">
              {totalCount} {totalCount === 1 ? "account" : "accounts"}
            </span>
            <Button variant="adminPrimary" size="sm" asChild>
              <Link href="/admin/users/new">Invite user</Link>
            </Button>
          </div>
        </header>

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
          </div>
        </section>

        <UserAccountsTable users={users} />

        <footer className={adminUsersPagination}>
          <p className="admin-users-pagination-page">
            Page {page} of {totalPages}
          </p>
          <AdminUsersPagination
            page={page}
            totalPages={totalPages}
            filter="all"
            search={search}
            basePath="/admin/user-management"
          />
        </footer>
      </div>
    </div>
  );
}
