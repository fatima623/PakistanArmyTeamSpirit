"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { CSSProperties } from "react";
import { Globe, Check } from "lucide-react";

import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/**
 * Language selector for the public marketing chrome. Mirrors the participant
 * portal switcher (writes the locale cookie via a server action, then refreshes
 * so server components re-render in the chosen language), but is styled to sit
 * alongside the theme toggle in the site nav.
 */
export function PublicLanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const selectLanguage = t.publicSite.chrome.selectLanguage;
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // The menu is positioned `fixed` (measured from the trigger) so it is not
  // clipped by the nav's horizontally-scrolling link row (`overflow-x: auto`,
  // which also clips vertically).
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const measure = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  // Close on outside click or Escape while the menu is open; keep it anchored.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, measure]);

  function toggle() {
    if (!open) measure();
    setOpen((prev) => !prev);
  }

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    // Public marketing pages are a mix of static (revalidate) and dynamic
    // routes, so a full reload is the deterministic way to re-render every
    // page in the new locale (router.refresh() serves the cached static copy).
    startTransition(async () => {
      await setLocale(next);
      window.location.reload();
    });
  }

  return (
    <div
      ref={rootRef}
      className={cn("pats-nav__lang", className)}
      data-open={open ? "true" : undefined}
      data-pending={pending ? "true" : undefined}
    >
      <button
        ref={triggerRef}
        type="button"
        className="pats-nav__lang-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={selectLanguage}
        title={LOCALE_LABELS[locale]}
        disabled={pending}
        onClick={toggle}
      >
        <Globe className="pats-nav__lang-icon" aria-hidden strokeWidth={2} />
        <span className="pats-nav__lang-code">{locale.toUpperCase()}</span>
      </button>

      {open ? (
        <ul
          className="pats-nav__lang-menu"
          role="menu"
          aria-label={selectLanguage}
          style={menuStyle}
        >
          {LOCALES.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="none">
                <button
                  type="button"
                  role="menuitem"
                  aria-current={active ? "true" : undefined}
                  className="pats-nav__lang-option"
                  data-active={active ? "true" : undefined}
                  onClick={() => choose(code)}
                >
                  <span>{LOCALE_LABELS[code]}</span>
                  {active ? (
                    <Check className="pats-nav__lang-check" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
