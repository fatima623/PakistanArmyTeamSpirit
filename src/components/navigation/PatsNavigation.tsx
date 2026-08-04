"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { PatsLogo } from "@/components/pats/PatsLogo";
import { PublicLanguageSwitcher } from "@/components/navigation/PublicLanguageSwitcher";
import { SiteThemeToggle } from "@/components/theme/SiteThemeToggle";
import { useSiteTheme } from "@/components/theme/SiteThemeProvider";
import { NAV_BRAND_SUBTITLE, NAV_BRAND_TITLE } from "@/lib/branding";
import {
  isHrefActive,
  isNavItemActive,
  PUBLIC_NAV_ITEMS,
  type PublicNavItem,
} from "@/lib/public-navigation";
import { useSiteChromeScroll } from "@/components/public/site-chrome-scroll-context";
import { pathnameHasHeroOverlay } from "@/lib/public-layout";
import { useI18nOptional } from "@/lib/i18n/I18nProvider";
import { publicNavLabel } from "@/lib/i18n/public-nav-labels";
import { cn } from "@/lib/utils";

const DROPDOWN_CLOSE_MS = 150;

/** The viewport at which the nav switches from the mobile hamburger panel to the
 *  inline desktop link row — kept in sync with the `1024px` CSS breakpoints. */
const DESKTOP_NAV_QUERY = "(min-width: 1024px)";

/** Tracks whether the desktop (inline) nav layout is active. Starts `false` so
 *  the server render and first client paint agree (mobile-first), then reads the
 *  real match on mount — mirroring the existing "reveal links after mount"
 *  behaviour without introducing a hydration mismatch. */
function useIsDesktopNav(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_NAV_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function PafMenuIcon() {
  return (
    <span className="pats-nav__menu-icon" aria-hidden>
      <span className="pats-nav__menu-line" />
      <span className="pats-nav__menu-line" />
      <span className="pats-nav__menu-line" />
    </span>
  );
}

function NavDropdown({
  item,
  label,
  pathname,
  onNavigate,
}: {
  item: PublicNavItem;
  label: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = isNavItemActive(pathname, item);

  const clearLeaveTimer = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  useEffect(() => () => clearLeaveTimer(), []);

  if (!item.children?.length) return null;

  return (
    <div
      className={cn("pats-nav__item", open && "pats-nav__item--open")}
      onMouseEnter={() => {
        clearLeaveTimer();
        setOpen(true);
      }}
      onMouseLeave={() => {
        clearLeaveTimer();
        leaveTimer.current = setTimeout(() => setOpen(false), DROPDOWN_CLOSE_MS);
      }}
    >
      <button
        type="button"
        className={cn(
          "pats-nav__link pats-nav__link--trigger",
          active && "pats-nav__link--active"
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      <div className="pats-nav__dropdown" role="menu">
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            prefetch
            role="menuitem"
            onClick={onNavigate}
            className={cn(
              "pats-nav__dropdown-link",
              isHrefActive(pathname, child.href) && "pats-nav__dropdown-link--active"
            )}
          >
            {child.label}
            <span className="pats-nav__dropdown-arrow" aria-hidden>
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavItemLink({
  item,
  label,
  pathname,
  onNavigate,
}: {
  item: PublicNavItem;
  label: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  if (item.children?.length) {
    return (
      <NavDropdown
        item={item}
        label={label}
        pathname={pathname}
        onNavigate={onNavigate}
      />
    );
  }

  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      prefetch
      onClick={onNavigate}
      className={cn(
        "pats-nav__link",
        isNavItemActive(pathname, item) && "pats-nav__link--active"
      )}
    >
      {label}
    </Link>
  );
}

function NavLoginLink({
  pathname,
  onNavigate,
  label,
}: {
  pathname: string;
  onNavigate?: () => void;
  label: string;
}) {
  return (
    <Link
      href="/event/login"
      prefetch
      onClick={onNavigate}
      className={cn(
        "pats-nav__link",
        isHrefActive(pathname, "/event/login") && "pats-nav__link--active"
      )}
    >
      {label}
    </Link>
  );
}

type Props = {
  pathname: string;
};

/** Fixed transparent nav over hero; logo + hamburger; links in panel when open. */
export function PatsNavigation({ pathname: pathnameProp }: Props) {
  const pathnameFromRouter = usePathname();
  const pathname = pathnameFromRouter ?? pathnameProp;
  // The public nav is also mounted (usually hidden) by the dashboard shell and
  // the 404 page, which don't wrap it in an I18nProvider — so read the locale
  // optionally and fall back to the English PUBLIC_NAV_ITEMS labels.
  const i18n = useI18nOptional();
  const t = i18n?.t ?? null;
  const chrome = t?.publicSite.chrome;
  const loginLabel = t ? t.publicSite.nav.login : "Login";
  const isHome = pathname === "/";
  const overHeroMedia = pathnameHasHeroOverlay(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const isDesktop = useIsDesktopNav();
  const { dayTheme } = useSiteTheme();
  const { scrolled: chromeScrolled, pastHero } = useSiteChromeScroll();
  const forceSolidMobileMenu = dayTheme && !isDesktop && menuOpen;
  const isSolid = overHeroMedia ? chromeScrolled || pastHero || forceSolidMobileMenu : true;
  const isScrolled = isSolid;
  const isCompact = isSolid;
  const isShrunk = overHeroMedia ? pastHero : true;

  // On DESKTOP the link row is revealed inline as the header goes solid on
  // scroll (and stays shown on non-hero pages). On MOBILE that same `menuOpen`
  // state drives a full-screen hamburger panel, so it must NOT be tied to scroll
  // — the panel opens only when the user taps the menu button.
  useEffect(() => {
    if (!isDesktop) return;
    setMenuOpen(isScrolled);
  }, [isScrolled, isDesktop]);

  // Collapse the panel whenever we cross below the desktop breakpoint so a menu
  // left open on desktop doesn't reappear as an auto-opened mobile panel.
  useEffect(() => {
    if (!isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  // Lock body scroll while the mobile panel is open so only the nav is
  // interactive; scrolling resumes when it closes. Desktop is never locked.
  useEffect(() => {
    if (!menuOpen || isDesktop) return;
    const { documentElement: html, body } = document;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyTouch: body.style.touchAction,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.touchAction = prev.bodyTouch;
    };
  }, [menuOpen, isDesktop]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const toggleMenu = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen((open) => !open);
  }, []);

  return (
    <header
      className={cn(
        "pats-header",
        isHome && "pats-header--home",
        overHeroMedia && "pats-header--over-hero",
        isSolid && "pats-header--solid",
        isCompact && "pats-header--compact",
        isShrunk && "pats-header--shrunk",
        dayTheme && "pats-header--day",
        menuOpen && "pats-header--menu-open"
      )}
    >
      <div className="pats-nav" aria-label={chrome?.siteNav ?? "Site"}>
        <div className="pats-nav__inner">
          <Link
            href="/"
            className="pats-nav__brand"
            aria-label={chrome?.brandHome ?? "PATS home"}
          >
            <span className="pats-nav__emblem-wrap" aria-hidden>
              <PatsLogo
                size={isScrolled ? 48 : 96}
                priority={false}
                variant="nav"
                className="pats-nav__emblem"
              />
            </span>
            <span className="pats-nav__brand-text">
              <span className="pats-nav__brand-title">{NAV_BRAND_TITLE}</span>
              <span className="pats-nav__brand-subtitle">{NAV_BRAND_SUBTITLE}</span>
            </span>
          </Link>

          {menuOpen ? (
            <nav
              id="pats-nav-panel"
              className="pats-nav__panel-links"
              aria-label={chrome?.mainNav ?? "Main navigation"}
            >
              {PUBLIC_NAV_ITEMS.map((item) => (
                <NavItemLink
                  key={item.label}
                  item={item}
                  label={publicNavLabel(t, item.href, item.label)}
                  pathname={pathname}
                  onNavigate={closeMenu}
                />
              ))}
              <NavLoginLink
                pathname={pathname}
                onNavigate={closeMenu}
                label={loginLabel}
              />
              {i18n ? <PublicLanguageSwitcher /> : null}
              <SiteThemeToggle />
            </nav>
          ) : null}

          <button
            type="button"
            className="pats-nav__menu-btn"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="pats-nav-panel"
            aria-label={
              menuOpen
                ? (chrome?.closeMenu ?? "Close menu")
                : (chrome?.openMenu ?? "Open menu")
            }
          >
            <PafMenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
