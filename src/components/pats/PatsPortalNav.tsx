"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Plane,
  Shield,
  Users,
} from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "./LanguageSwitcher";

type NavGate = "always" | "payment" | "flights" | "hostInfo";
type NavKey = keyof Dictionary["nav"];

const BASE_LINKS: {
  href: string;
  labelKey: NavKey;
  Icon: LucideIcon;
  gate: NavGate;
}[] = [
  { href: "/event/dashboard", labelKey: "dashboard", Icon: LayoutDashboard, gate: "always" },
  { href: "/event/edit/unit", labelKey: "unitInformation", Icon: ClipboardList, gate: "always" },
  { href: "/event/team", labelKey: "teamRegistration", Icon: Users, gate: "always" },
  { href: "/event/payment", labelKey: "payment", Icon: CreditCard, gate: "payment" },
  { href: "/event/flights", labelKey: "flightDetails", Icon: Plane, gate: "flights" },
  { href: "/event/host-info", labelKey: "hostInformation", Icon: Home, gate: "hostInfo" },
  { href: "/event/tickets", labelKey: "support", Icon: LifeBuoy, gate: "always" },
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
  const { t } = useI18n();
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
    <nav className="pp-sidebar" aria-label={t.nav.ariaLabel}>
      <div className="pp-sidebar__brand">
        <span className="pp-sidebar__mark" aria-hidden>
          <Shield className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="pp-sidebar__brand-title">{t.nav.portalName}</div>
          <div className="pp-sidebar__brand-sub">{t.nav.participant}</div>
        </div>
      </div>

      {stageLabel && stageStep ? (
        <div className="pp-progress">
          <div className="pp-progress__row">
            <span className="pp-progress__label">{stageLabel}</span>
            <span className="pp-progress__step">
              {stageTone === "confirmed"
                ? t.nav.done
                : `${stageStep.current}/${stageStep.total}`}
            </span>
          </div>
          <div className="pp-progress__track">
            <div className="pp-progress__fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}

      <div className="pp-nav">
        <p className="pp-nav__label">{t.nav.menu}</p>
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
                  <span>{t.nav[link.labelKey]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pp-sidebar__foot">
        <LanguageSwitcher />
        <form action={logoutAction}>
          <button type="submit" className="pp-logout">
            <LogOut className="pp-nav__icon" aria-hidden />
            <span>{t.nav.logout}</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
