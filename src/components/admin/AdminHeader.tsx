"use client";

import Link from "next/link";
import { Bell, Menu, Settings } from "lucide-react";

import { AdminUserMenu } from "@/components/admin/AdminUserMenu";

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
        <h1 className="admin-heading truncate">{title}</h1>
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
          className="admin-header-iconbtn hidden sm:inline-flex"
          aria-label="Site settings"
          title="Site settings"
        >
          <Settings className="h-[18px] w-[18px]" aria-hidden />
        </Link>
        <span className="admin-header-divider hidden sm:block" aria-hidden />
        <AdminUserMenu userInitials={userInitials} />
      </div>
    </header>
  );
}
