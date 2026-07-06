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
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="admin-user-detail-page">
      <AdminBreadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "User Management", href: "/admin/user-management" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
      />
      <header className="admin-user-detail-hero">
        <div className="admin-user-detail-hero-main">
          <h1 className="admin-user-detail-name">
            {user.firstName} {user.lastName}
          </h1>
          <p className="admin-user-detail-subline">
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
        }}
      />
    </div>
  );
}
