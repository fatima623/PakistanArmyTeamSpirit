import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAdminRole } from "@/lib/admin-session";
import { canManageSystem } from "@/lib/auth-routes";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminCreateUserForm } from "@/components/admin/AdminCreateUserForm";

export const metadata: Metadata = {
  title: "Create user",
};

export default async function AdminCreateUserPage() {
  // Only full admins may create users / assign roles.
  const role = await getAdminRole();
  if (!canManageSystem(role)) {
    redirect("/admin/users");
  }

  return (
    <div className="admin-user-detail-page">
      <AdminBreadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "User Management", href: "/admin/user-management" },
          { label: "Create user" },
        ]}
      />
      <header className="admin-user-detail-hero">
        <div className="admin-user-detail-hero-main">
          <h1 className="admin-user-detail-name">Create user</h1>
          <p className="admin-user-detail-subline">
            Add a participant or a back-office team member (SDBS / MTD / Admin).
          </p>
        </div>
      </header>

      <AdminCreateUserForm />
    </div>
  );
}
