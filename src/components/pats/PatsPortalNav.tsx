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
  Shield,
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

  const pct =
    stageStep && stageStep.total > 0
      ? Math.round((stageStep.current / stageStep.total) * 100)
      : 0;

  return (
    <nav className="pp-sidebar" aria-label="Participant portal">
      <div className="pp-sidebar__brand">
        <span className="pp-sidebar__mark" aria-hidden>
          <Shield className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="pp-sidebar__brand-title">PATS Portal</div>
          <div className="pp-sidebar__brand-sub">Participant</div>
        </div>
      </div>

      {stageLabel && stageStep ? (
        <div className="pp-progress">
          <div className="pp-progress__row">
            <span className="pp-progress__label">{stageLabel}</span>
            <span className="pp-progress__step">
              {stageTone === "confirmed"
                ? "Done"
                : `${stageStep.current}/${stageStep.total}`}
            </span>
          </div>
          <div className="pp-progress__track">
            <div className="pp-progress__fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}

      <div className="pp-nav">
        <p className="pp-nav__label">Menu</p>
        <ul className="pp-nav__list">
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
                  className={cn("pp-nav__link", active && "is-active")}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="pp-nav__icon" aria-hidden />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pp-sidebar__foot">
        <form action={logoutAction}>
          <button type="submit" className="pp-logout">
            <LogOut className="pp-nav__icon" aria-hidden />
            <span>Log out</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
