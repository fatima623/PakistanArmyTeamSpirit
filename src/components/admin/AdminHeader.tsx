"use client";

import Link from "next/link";
import { Bell, Eye, Menu, Search } from "lucide-react";

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
          className="mr-3 rounded-md p-1.5 text-[#0f172a] transition-colors hover:bg-gray-100 hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/30 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="admin-header-titlewrap">
          <div className="admin-header-crumb" aria-hidden>
            <span>Home</span>
            <span className="admin-header-crumb-sep">/</span>
            <span className="truncate">{title}</span>
          </div>
          <h1 className="admin-heading truncate">{title}</h1>
        </div>
      </div>

      <div className="admin-header-actions flex flex-shrink-0 items-center gap-3">
        <Link
          href="/"
          className="admin-header-pview hidden items-center gap-1.5 md:inline-flex"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
          Participant view
        </Link>
        <form
          action="/admin/users"
          method="get"
          role="search"
          className="relative hidden sm:block"
        >
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            name="search"
            placeholder="Search participants…"
            aria-label="Search participants by name or email"
            className="h-9 w-44 rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm text-[#0f172a] outline-none transition focus:w-60 focus:border-cp-olive focus:ring-2 focus:ring-cp-olive/20"
          />
        </form>
        <span className="admin-header-live hidden md:inline-flex" aria-hidden>
          <span className="admin-header-live-dot" />
          Live
        </span>
        <button
          type="button"
          className="admin-header-bell hidden sm:inline-flex"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden />
        </button>
        <AdminUserMenu userInitials={userInitials} />
      </div>
    </header>
  );
}
