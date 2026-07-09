import type { Metadata } from "next";
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
        <header className="flex w-full items-start justify-between gap-4">
          <div className="flex min-w-0 w-full flex-row flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-brand-line/60 pb-1">
            <h2 className="admin-users-panel-title">Accounts &amp; roles</h2>
            <p className="m-0 min-w-0 max-w-[42rem] flex-[1_1_auto] text-[0.9375rem] leading-[1.55] text-slate-900">
              Manage staff roles, access levels, and account status.
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
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
              className="relative min-w-0"
              inputClassName="h-11 w-full rounded-[10px] bg-white pl-10 pr-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-900/40 focus-visible:border-brand-olive/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-olive/15 focus-visible:ring-offset-0"
              iconClassName="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-900 opacity-45"
            />
          </div>
        </section>

        <UserAccountsTable users={users} startIndex={(page - 1) * PAGE_SIZE} />

        <footer className={adminUsersPagination}>
          <p className="m-0 text-sm font-medium text-slate-900">
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
