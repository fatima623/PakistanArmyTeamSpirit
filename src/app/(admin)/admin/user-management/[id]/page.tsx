import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/admin-session";
import { canManageSystem } from "@/lib/auth-routes";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

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
      unit: {
        select: {
          unitType: true,
          branch: true,
          unitName: true,
          arm: true,
          secondPocEmail: true,
          thirdPocEmail: true,
          additionalInfo: true,
          coName: true,
          coEmail: true,
          coPhone: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <AdminUserForm
      mode="edit"
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
        unit: user.unit,
      }}
    />
  );
}
