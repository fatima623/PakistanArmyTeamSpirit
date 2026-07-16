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

  // The admin area is English-only, so it opts out of the document-level
  // direction that the root layout derives from the participant's locale —
  // otherwise picking Arabic on the public site would mirror this UI while
  // leaving its untranslated English copy in place.
  return (
    <div className="admin-theme pats-dashboard min-h-screen" lang="en" dir="ltr">
      {children}
    </div>
  );
}
