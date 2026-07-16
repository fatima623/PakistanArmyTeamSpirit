"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { AnnouncementTicker } from "@/components/cinematic/AnnouncementTicker";
import { navDrop } from "@/components/cinematic/motion";
import { PublicLanguageSwitcher } from "@/components/navigation/PublicLanguageSwitcher";
import { NAV_BRAND_TITLE } from "@/lib/branding";
import { useI18nOptional } from "@/lib/i18n/I18nProvider";
import { publicNavLabel } from "@/lib/i18n/public-nav-labels";
import { PUBLIC_NAV } from "@/lib/pats-public";
import type { PublicTickerItem } from "@/lib/ticker";
import { cn } from "@/lib/utils";

const navItems = [...PUBLIC_NAV];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function CinematicNav({
  pathname,
  dayTheme = false,
  tickerItems = [],
  tickerScrollDurationSec,
}: {
  pathname: string;
  dayTheme?: boolean;
  tickerItems?: PublicTickerItem[];
  tickerScrollDurationSec?: number;
}) {
  // Mounted by the public shell (inside an I18nProvider) and by the 404 page
  // (outside one), so read the locale optionally and fall back to English.
  const i18n = useI18nOptional();
  const t = i18n?.t ?? null;
  const chrome = t?.publicSite.chrome;
  const loginLabel = t ? t.publicSite.nav.login : "Login";

  const isHome = pathname === "/" && !dayTheme;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);

  const solid = dayTheme || scrolled || !isHome;
  const reduce = useReducedMotion();

  return (
    <motion.header
      initial={reduce || dayTheme ? false : "hidden"}
      animate="visible"
      variants={navDrop}
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex flex-col transition-[background-color,backdrop-filter,box-shadow] duration-300 ease-mechanical",
        dayTheme
          ? "border-b border-brand-line bg-white/95 shadow-sm backdrop-blur-md"
          : solid
            ? "bg-brand-night/92 shadow-lg backdrop-blur-lg"
            : "bg-transparent"
      )}
    >
      <AnnouncementTicker
        items={tickerItems}
        scrollDurationSec={tickerScrollDurationSec}
        className={cn(
          solid
            ? "bg-brand-night/95"
            : "bg-brand-night/75 backdrop-blur-sm"
        )}
      />
      <div
        className={cn(
          "border-b transition-[border-color] duration-500",
          dayTheme
            ? "border-brand-line"
            : solid
              ? "border-white/15"
              : "border-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-8 sm:py-3">
        <Link href="/" className="group flex min-w-0 items-center">
          <span
            className={cn(
              "cinematic-nav-brand font-display font-extrabold uppercase",
              dayTheme ? "text-brand-ink" : "cinematic-heading text-white"
            )}
          >
            {NAV_BRAND_TITLE}
          </span>
        </Link>

        <nav
          aria-label={chrome?.mainNav ?? "Main navigation"}
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "cinematic-nav-link",
                isActive(pathname, item.href)
                  ? "cinematic-nav-link-active"
                  : "cinematic-nav-link-inactive"
              )}
            >
              {publicNavLabel(t, item.href, item.label)}
            </Link>
          ))}
          <Link href="/event/login" className="cinematic-btn-nav ml-3">
            {loginLabel}
          </Link>
          {i18n ? <PublicLanguageSwitcher className="ml-2" /> : null}
        </nav>

        <button
          type="button"
          className={cn(
            "rounded-sm p-2 transition-colors active:scale-95 md:hidden",
            dayTheme
              ? "text-brand-ink hover:text-brand-olive-dark"
              : "text-white hover:text-brand-brass"
          )}
          onClick={mobileOpen ? closeMobile : openMobile}
          aria-expanded={mobileOpen}
          aria-controls="cinematic-mobile-nav"
          aria-label={
            mobileOpen
              ? (chrome?.closeMenu ?? "Close menu")
              : (chrome?.openMenu ?? "Open menu")
          }
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </div>
      </div>

      {mobileOpen ? (
          <div
            id="cinematic-mobile-nav"
            className={cn(
              "cinematic-mobile-nav-panel overflow-hidden border-t backdrop-blur-xl md:hidden",
              dayTheme
                ? "border-brand-line bg-white"
                : "border-white/10 bg-brand-night/95"
            )}
          >
            <div className="space-y-1 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-sm px-3 py-3.5 font-condensed text-lg font-bold uppercase tracking-[0.1em] transition-colors",
                    dayTheme ? "active:bg-brand-parchment-2" : "active:bg-white/10",
                    isActive(pathname, item.href)
                      ? dayTheme
                        ? "text-brand-olive-dark"
                        : "text-brand-brass"
                      : dayTheme
                        ? "text-brand-ink hover:text-brand-olive-dark"
                        : "text-white hover:text-brand-brass"
                  )}
                >
                  {publicNavLabel(t, item.href, item.label)}
                </Link>
              ))}
              <Link
                href="/event/login"
                className="cinematic-btn-nav mt-4 w-full"
              >
                {loginLabel}
              </Link>
              {i18n ? (
                <div className="mt-4 flex justify-start pt-1">
                  <PublicLanguageSwitcher />
                </div>
              ) : null}
            </div>
          </div>
      ) : null}
    </motion.header>
  );
}
