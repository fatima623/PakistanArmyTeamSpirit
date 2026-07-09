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
    <div className="flex w-full flex-col gap-[0.85rem] pb-2">
      <AdminBreadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "User Management", href: "/admin/user-management" },
          { label: "Create user" },
        ]}
      />
      <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[14px] border border-brand-line/60 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        <div className="min-w-0 flex-[1_1_16rem]">
          <h1 className="m-0 flex flex-wrap items-center gap-2 text-[1.15rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-brand-ink">Create user</h1>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            Add a participant or a back-office team member (SDBS / MTD / Admin).
          </p>
        </div>
      </header>

      <AdminCreateUserForm />
    </div>
  );
}
