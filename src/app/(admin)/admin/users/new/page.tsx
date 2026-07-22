import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAdminRole } from "@/lib/admin-session";
import { canManageSystem } from "@/lib/auth-routes";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

export const metadata: Metadata = {
  title: "Create user",
};

export default async function AdminCreateUserPage() {
  // Only full admins may create users / assign roles.
  const role = await getAdminRole();
  if (!canManageSystem(role)) {
    redirect("/admin/users");
  }

  return <AdminUserForm mode="create" />;
}
