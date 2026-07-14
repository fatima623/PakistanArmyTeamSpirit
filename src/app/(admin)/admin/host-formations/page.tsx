import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/admin-session";
import { canManageSystem } from "@/lib/auth-routes";
import { adminNavLabel } from "@/lib/admin-navigation";
import { HostFormationsManager } from "@/components/admin/admin-dynamic";

export const metadata: Metadata = {
  title: adminNavLabel("hostFormations"),
};

export default async function AdminHostFormationsPage() {
  // Nav filtering hides the link for MT/SD; enforce admin-only at the page too.
  const role = await getAdminRole();
  if (!canManageSystem(role)) {
    redirect("/admin");
  }

  const formations = await prisma.hostFormation.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      notes: true,
      createdAt: true,
      hostUser: { select: { email: true, firstName: true, lastName: true } },
      _count: { select: { members: true } },
    },
  });

  const initialFormations = formations.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
  }));

  return <HostFormationsManager initialFormations={initialFormations} />;
}
