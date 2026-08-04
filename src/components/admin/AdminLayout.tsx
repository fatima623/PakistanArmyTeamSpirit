"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  adminNavLabel,
  adminNavLabelForPath,
  resolveAdminNavKey,
  type AdminNavKey,
} from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";

/**
 * Shared admin chrome — fixed 220px sidebar, 64px header, scrollable content.
 * Used by every page under /admin.
 */
export function AdminLayout({
  section,
  title,
  userInitials,
  role,
  navCounts,
  children,
}: {
  section?: AdminNavKey;
  title?: string;
  userInitials: string;
  role?: string;
  navCounts?: Partial<Record<AdminNavKey, number>>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const resolvedSection = section ?? resolveAdminNavKey(pathname);
  const headerTitle = resolvedSection
    ? adminNavLabel(resolvedSection)
    : (title ?? adminNavLabelForPath(pathname));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the off-canvas drawer on navigation so it never lingers over the new
  // page (the sidebar stays mounted across route changes).
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open (desktop keeps the sidebar
  // docked, so the lock is scoped to the open state only).
  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="admin-layout admin-theme pats-dashboard min-h-screen">
      <aside
        className={cn(
          "admin-layout-sidebar",
          sidebarOpen && "admin-layout-sidebar--open"
        )}
        aria-label="Admin navigation"
      >
        <AdminSidebar
          role={role}
          navCounts={navCounts}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="admin-layout-backdrop lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="admin-layout-main">
        <AdminHeader
          title={headerTitle}
          userInitials={userInitials}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main
          id="main-content"
          className="admin-layout-content"
        >
          <div className="admin-page-content mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/** @deprecated Use AdminLayout */
export const AdminShell = AdminLayout;
