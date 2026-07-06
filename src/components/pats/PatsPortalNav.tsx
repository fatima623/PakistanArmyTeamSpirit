"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const BASE_LINKS: {
  href: string;
  label: string;
  Icon: LucideIcon;
  requiresApproval?: boolean;
}[] = [
  { href: "/event/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/event/edit/unit", label: "Unit information", Icon: ClipboardList },
  { href: "/event/team", label: "Team Members", Icon: Users },
  {
    href: "/event/payment",
    label: "Payment",
    Icon: CreditCard,
    requiresApproval: true,
  },
  { href: "/event/timeline", label: "Timeline", Icon: CalendarClock },
  { href: "/event/tickets", label: "Support", Icon: LifeBuoy },
  { href: "/event/edit/privacy", label: "Privacy policy", Icon: ShieldCheck },
];

const STAGE_META: Record<1 | 2 | 3, { label: string; tone: string }> = {
  1: { label: "Awaiting review", tone: "pending" },
  2: { label: "Payment required", tone: "pending" },
  3: { label: "Confirmed", tone: "confirmed" },
};

export function PatsPortalNav({
  showPaymentLink = false,
  stage,
}: {
  showPaymentLink?: boolean;
  stage?: 1 | 2 | 3;
}) {
  const pathname = usePathname();
  const links = BASE_LINKS.filter(
    (link) => !("requiresApproval" in link && link.requiresApproval) || showPaymentLink
  );
  const stageMeta = stage ? STAGE_META[stage] : null;

  return (
    <nav className="pats-portal-nav" aria-label="Participant portal">
      <p className="pats-eyebrow mb-3">Portal</p>
      {stageMeta ? (
        <div className={`pats-portal-stage-chip pats-portal-stage-chip--${stageMeta.tone}`}>
          <span className="pats-portal-stage-dot" aria-hidden />
          <span className="pats-portal-stage-label">{stageMeta.label}</span>
          <span className="pats-portal-stage-step">Step {stage}/3</span>
        </div>
      ) : null}
      <ul>
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/event/dashboard" && pathname.startsWith(link.href));
          const Icon = link.Icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch
                className={cn("inline-flex items-center gap-2", active && "is-active")}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <form action={logoutAction} className="pats-portal-nav-logout">
        <button type="submit" className="pats-portal-logout">
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          <span>Log out</span>
        </button>
      </form>
    </nav>
  );
}
