"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { PatsLogo } from "@/components/pats/PatsLogo";
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
import { cn } from "@/lib/utils";

const DROPDOWN_CLOSE_MS = 150;

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
  pathname,
  onNavigate,
}: {
  item: PublicNavItem;
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
        {item.label}
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
  pathname,
  onNavigate,
}: {
  item: PublicNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  if (item.children?.length) {
    return (
      <NavDropdown item={item} pathname={pathname} onNavigate={onNavigate} />
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
      {item.label}
    </Link>
  );
}

function NavLoginLink({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
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
      Login
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
  const isHome = pathname === "/";
  const overHeroMedia = pathnameHasHeroOverlay(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const { dayTheme } = useSiteTheme();
  const { scrolled: chromeScrolled, pastHero } = useSiteChromeScroll();
  const isSolid = overHeroMedia ? chromeScrolled || pastHero : true;
  const isScrolled = isSolid;
  const isCompact = isSolid;
  const isShrunk = overHeroMedia ? pastHero : true;

  useEffect(() => {
    if (isScrolled) {
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
    }
  }, [isScrolled]);

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
      <div className="pats-nav" aria-label="Site">
        <div className="pats-nav__inner">
          <Link href="/" className="pats-nav__brand" aria-label="PATS home">
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
              aria-label="Main navigation"
            >
              {PUBLIC_NAV_ITEMS.map((item) => (
                <NavItemLink
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeMenu}
                />
              ))}
              <NavLoginLink pathname={pathname} onNavigate={closeMenu} />
              <SiteThemeToggle />
            </nav>
          ) : null}

          <button
            type="button"
            className="pats-nav__menu-btn"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="pats-nav-panel"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <PafMenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
