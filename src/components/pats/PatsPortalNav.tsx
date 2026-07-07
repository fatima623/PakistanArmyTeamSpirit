"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Plane,
  ShieldCheck,
  Users,
} from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type NavGate = "always" | "payment" | "flights" | "hostInfo";

const BASE_LINKS: {
  href: string;
  label: string;
  Icon: LucideIcon;
  gate: NavGate;
}[] = [
  { href: "/event/dashboard", label: "Dashboard", Icon: LayoutDashboard, gate: "always" },
  { href: "/event/edit/unit", label: "Unit information", Icon: ClipboardList, gate: "always" },
  { href: "/event/team", label: "Team Registration", Icon: Users, gate: "always" },
  { href: "/event/payment", label: "Payment", Icon: CreditCard, gate: "payment" },
  { href: "/event/flights", label: "Flight Details", Icon: Plane, gate: "flights" },
  { href: "/event/host-info", label: "Host Information", Icon: Home, gate: "hostInfo" },
  { href: "/event/timeline", label: "Timeline", Icon: CalendarClock, gate: "always" },
  { href: "/event/tickets", label: "Support", Icon: LifeBuoy, gate: "always" },
  { href: "/event/edit/privacy", label: "Privacy policy", Icon: ShieldCheck, gate: "always" },
];

export function PatsPortalNav({
  showPaymentLink = false,
  showFlightsLink = false,
  showHostInfoLink = false,
  stageLabel,
  stageStep,
  stageTone = "pending",
}: {
  showPaymentLink?: boolean;
  showFlightsLink?: boolean;
  showHostInfoLink?: boolean;
  stageLabel?: string;
  stageStep?: { current: number; total: number };
  stageTone?: "pending" | "confirmed";
}) {
  const pathname = usePathname();
  const gates: Record<NavGate, boolean> = {
    always: true,
    payment: showPaymentLink,
    flights: showFlightsLink,
    hostInfo: showHostInfoLink,
  };
  const links = BASE_LINKS.filter((link) => gates[link.gate]);

  return (
    <nav className="pats-portal-nav" aria-label="Participant portal">
      <p className="pats-eyebrow mb-3">Portal</p>
      {stageLabel && stageStep ? (
        <div className={`pats-portal-stage-chip pats-portal-stage-chip--${stageTone}`}>
          <span className="pats-portal-stage-dot" aria-hidden />
          <span className="pats-portal-stage-label">{stageLabel}</span>
          <span className="pats-portal-stage-step">
            Step {stageStep.current}/{stageStep.total}
          </span>
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
