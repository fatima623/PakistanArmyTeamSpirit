import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

import { getCachedSession } from "@/lib/cached-auth";
import { canAccessHostArea, getRoleHomePath } from "@/lib/auth-routes";
import { logoutAction } from "@/lib/actions/auth";
import { PatsLogo } from "@/components/pats/PatsLogo";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/event/login");
  }
  if (!canAccessHostArea(session.user.role)) {
    redirect(getRoleHomePath(session.user.role));
  }

  // English-only area — opt out of the locale-derived document direction set by
  // the root layout (see the admin layout for the same reasoning).
  return (
    <div
      className="admin-theme pats-dashboard min-h-screen bg-slate-50"
      lang="en"
      dir="ltr"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex min-w-0 items-center gap-2.5">
          <PatsLogo size={34} variant="nav" className="flex-shrink-0" />
          <div className="min-w-0 leading-tight">
            {/* Arbitrary sizes on purpose: inside `.admin-theme.pats-dashboard`
                globals.css rewrites text-xs/sm/base to a single 18px body size
                and text-xl+ to a 44px display clamp. */}
            <p className="m-0 truncate text-[0.9375rem] font-bold text-slate-900">
              PATS Host Portal
            </p>
            <p className="m-0 truncate text-[0.75rem] text-slate-500">
              Read-only exercise information
            </p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log Out
          </button>
        </form>
      </header>
      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
