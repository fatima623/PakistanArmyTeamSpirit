import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/admin-session";
import { canManageSystem } from "@/lib/auth-routes";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminEditUserForm } from "@/components/admin/AdminEditUserForm";

export const metadata: Metadata = {
  title: "Manage user",
};

type Params = Promise<{ id: string }>;

export default async function AdminManageUserPage({
  params,
}: {
  params: Params;
}) {
  const role = await getAdminRole();
  if (!canManageSystem(role)) {
    redirect("/admin/users");
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      rank: true,
      gender: true,
      role: true,
      country: true,
      nationality: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="flex w-full flex-col gap-[0.85rem] pb-2">
      <AdminBreadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "User Management", href: "/admin/user-management" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
      />
      <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[14px] border border-brand-line/60 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        <div className="min-w-0 flex-[1_1_16rem]">
          <h1 className="m-0 flex flex-wrap items-center gap-2 text-[1.15rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-brand-ink">
            {user.firstName} {user.lastName}
          </h1>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            Update account details, role, password, or remove the account.
          </p>
        </div>
      </header>

      <AdminEditUserForm
        user={{
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          rank: user.rank ?? "",
          gender: user.gender ?? "Other",
          role: user.role,
          country: user.country,
          nationality: user.nationality,
        }}
      />
    </div>
  );
}
