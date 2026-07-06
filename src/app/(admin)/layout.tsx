import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { getCachedSession } from "@/lib/cached-auth";
import { canAccessAdminArea, getRoleHomePath } from "@/lib/auth-routes";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/event/login");
  }
  if (!canAccessAdminArea(session.user.role)) {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="admin-theme pats-dashboard min-h-screen">{children}</div>
  );
}
