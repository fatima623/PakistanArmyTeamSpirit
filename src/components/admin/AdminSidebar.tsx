"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Calendar,
  CreditCard,
  Images,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Newspaper,
  Plane,
  Settings,
  Shield,
  Trophy,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_ITEMS,
  adminNavGroupsForRole,
  type AdminNavKey,
} from "@/lib/admin-navigation";
import { PatsLogo } from "@/components/pats/PatsLogo";

/** Sidebar identity strip copy, keyed on staff role. */
const ROLE_IDENTITY: Record<string, { label: string; access: string }> = {
  admin: { label: "Administrator", access: "System management" },
  mtd: { label: "MT (Management Team)", access: "Payment verification" },
  sdbs: { label: "SD (Sports Directorate)", access: "Registration verification" },
};

const navIcons: Record<(typeof ADMIN_NAV_ITEMS)[number]["key"], LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  payments: CreditCard,
  units: Shield,
  teamRequests: UserPlus,
  flights: Plane,
  hostFormations: Building2,
  news: Newspaper,
  events: Trophy,
  gallery: Images,
  ticker: Bell,
  keyDates: Calendar,
  tickets: LifeBuoy,
  userManagement: UserCog,
  settings: Settings,
};

export function AdminSidebar({
  role,
  navCounts,
  onClose,
}: {
  role?: string;
  navCounts?: Partial<Record<AdminNavKey, number>>;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const identity = (role && ROLE_IDENTITY[role]) || {
    label: "Staff",
    access: "Limited",
  };
  const navGroups = role
    ? adminNavGroupsForRole(role)
    : ADMIN_NAV_GROUPS.map((group) => ({
        group,
        items: ADMIN_NAV_ITEMS.filter((item) => item.group === group),
      })).filter((g) => g.items.length > 0);

  return (
    <aside className="admin-sidebar flex h-full w-full flex-col bg-white">
      <div className="admin-sidebar-brand">
        <Link
          href="/admin"
          prefetch
          onClick={onClose}
          className="admin-sidebar-brand-link"
        >
          <span className="admin-sidebar-brand-mark">
            <PatsLogo
              size={36}
              variant="nav"
              className="admin-sidebar-brand-logo"
            />
          </span>
          <span className="admin-sidebar-brand-text min-w-0">
            <span className="admin-sidebar-brand-title block truncate leading-tight">
              PATS
            </span>
            <span className="admin-sidebar-brand-subtitle block truncate">
              Command Center
            </span>
          </span>
        </Link>
      </div>

      <div className="admin-sidebar-role">
        <span className="admin-sidebar-role-dot" aria-hidden />
        <span className="admin-sidebar-role-label">{identity.label}</span>
        <span className="admin-sidebar-role-access">{identity.access}</span>
      </div>

      <nav className="admin-sidebar-nav flex-1 overflow-y-auto">
        {navGroups.map(({ group, items }) => (
          <div key={group} className="admin-sidebar-group">
            <p className="admin-sidebar-group-label px-3 pb-1 pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {group}
            </p>
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = navIcons[item.key];
              const count = navCounts?.[item.key];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  onClick={onClose}
                  data-active={isActive ? "true" : undefined}
                  className="admin-sidebar-link flex items-center gap-2.5"
                >
                  <Icon className="admin-sidebar-link-icon" />
                  <span className="leading-snug">{item.label}</span>
                  {count && count > 0 ? (
                    <span className="admin-sidebar-count">{count}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-footer admin-sidebar-footer--logout">
        <form action={logoutAction} className="admin-sidebar-footer-form">
          <button
            type="submit"
            className="admin-sidebar-logout"
          >
            <LogOut className="admin-sidebar-link-icon" />
            Log Out
          </button>
        </form>
      </div>
    </aside>
  );
}
