"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function AdminUserMenu({ userInitials }: { userInitials: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : "Administrator";
  const email = user?.email ?? "";
  const roleLabel =
    ({ admin: "Super Admin", mtd: "Approver", sdbs: "Viewer" } as Record<
      string,
      string
    >)[user?.role ?? ""] ?? "Staff";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id="admin-user-menu-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? "admin-user-menu" : undefined}
        onClick={() => setOpen((o) => !o)}
        data-open={open ? "true" : undefined}
        className="admin-user-trigger"
      >
        <span className="admin-user-avatar" aria-hidden>
          {userInitials}
        </span>
        <span className="admin-user-trigger-text hidden sm:flex">
          <span className="admin-user-trigger-name-row">
            <span className="admin-user-trigger-name">{displayName}</span>
            <span className="admin-user-role-badge">{roleLabel}</span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#0f172a] transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
        <span className="sr-only">Account menu</span>
      </button>

      {open && (
        <div
          id="admin-user-menu"
          role="menu"
          aria-labelledby="admin-user-menu-trigger"
          className="admin-dropdown-panel"
        >
          <div className="admin-dropdown-header" role="none">
            <p className="text-sm font-semibold text-brand-ink">{displayName}</p>
            {email ? (
              <p className="mt-0.5 truncate text-xs text-brand-ink-muted">{email}</p>
            ) : null}
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-olive/30 bg-brand-olive/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-brand-olive-dark">
              <ShieldCheck className="h-3 w-3" aria-hidden />
              {roleLabel}
            </p>
          </div>
          <form action={logoutAction} role="none">
            <button
              type="submit"
              role="menuitem"
              className="admin-dropdown-item admin-dropdown-item--logout"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
