"use client";

import Link from "next/link";
import { Bell, Menu, Settings } from "lucide-react";

import { AdminUserMenu } from "@/components/admin/AdminUserMenu";

export function AdminHeader({
  title,
  userInitials,
  onMenuToggle,
}: {
  title: string;
  userInitials: string;
  onMenuToggle: () => void;
}) {
  return (
    <header className="admin-header-bar admin-layout-header flex flex-shrink-0 items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center">
        <button
          type="button"
          onClick={onMenuToggle}
          className="admin-header-menu-btn mr-3 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="admin-header-titlewrap">
          <nav className="admin-header-crumb" aria-label="Breadcrumb">
            <Link href="/admin" className="admin-header-crumb-home">
              Home
            </Link>
            <span className="admin-header-crumb-sep" aria-hidden>
              /
            </span>
            <span className="admin-header-crumb-current truncate">{title}</span>
          </nav>
          <h1 className="admin-heading truncate">{title}</h1>
        </div>
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
