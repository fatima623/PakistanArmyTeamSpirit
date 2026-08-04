"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, Settings } from "lucide-react";

import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import { logoutAction } from "@/lib/actions/auth";

export function AdminHeader({
  title,
  userInitials,
  onMenuClick,
}: {
  title: string;
  userInitials: string;
  /** Opens the off-canvas sidebar on mobile (< lg). Absent on desktop chrome. */
  onMenuClick?: () => void;
}) {
  return (
    <header className="admin-header-bar admin-layout-header flex flex-shrink-0 items-center justify-between gap-3 sm:gap-4">
      <div className="admin-header-titlewrap flex min-w-0 flex-1 items-center gap-2">
        {onMenuClick ? (
          <button
            type="button"
            className="admin-header-iconbtn lg:hidden"
            aria-label="Open navigation menu"
            title="Menu"
            onClick={onMenuClick}
          >
            <Menu className="h-[18px] w-[18px]" aria-hidden />
          </button>
        ) : null}
        {/* The page name is redundant on phones — the sidebar entry the user
            just tapped already names the section, and the page's own panel
            heading repeats it. Kept from `lg` up where there is room. */}
        <h1 className="admin-heading hidden truncate lg:block">{title}</h1>
      </div>

      <div className="admin-header-actions flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          className="admin-header-iconbtn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden />
          <span className="admin-header-iconbtn-dot" aria-hidden />
        </button>
        <Link
          href="/admin/settings"
          className="admin-header-iconbtn hidden lg:inline-flex"
          aria-label="Site settings"
          title="Site settings"
        >
          <Settings className="h-[18px] w-[18px]" aria-hidden />
        </Link>
        <span className="admin-header-divider hidden lg:block" aria-hidden />

        {/* Mobile: the account name + role + chevron ate most of the bar, and
            its only action was "Log out" — so phones get that action directly.
            Desktop keeps the full account menu. */}
        <form action={logoutAction} className="lg:hidden">
          <button
            type="submit"
            className="admin-header-iconbtn"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </form>
        <div className="hidden lg:block">
          <AdminUserMenu userInitials={userInitials} />
        </div>
      </div>
    </header>
  );
}
