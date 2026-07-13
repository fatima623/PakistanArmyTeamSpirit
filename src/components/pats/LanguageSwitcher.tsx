"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";

import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Language selector for the participant portal. Writes the chosen locale to a
 * cookie via a server action, then refreshes so every server component in the
 * panel re-renders in the selected language (and flips to RTL for Arabic).
 *
 * Uses a custom themed dropdown (not a native <select>) so the option list can
 * match the sidebar's forest-green theme in both light and dark modes — the
 * native popup is OS-styled and cannot be themed.
 */
export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click or Escape while the menu is open.
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
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      ref={rootRef}
      className="pp-lang"
      data-open={open ? "true" : undefined}
      data-pending={pending ? "true" : undefined}
    >
      <button
        type="button"
        className="pp-lang__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.common.selectLanguage}
        disabled={pending}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="pp-lang__icon" aria-hidden>
          <Globe className="h-4 w-4" />
        </span>
        <span className="pp-lang__field">
          <span className="pp-lang__label">{t.common.language}</span>
          <span className="pp-lang__value">{LOCALE_LABELS[locale]}</span>
        </span>
        <ChevronDown className="pp-lang__chevron h-4 w-4" aria-hidden />
      </button>

      {open ? (
        <ul
          className="pp-lang__menu"
          role="menu"
          aria-label={t.common.selectLanguage}
        >
          {LOCALES.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="none">
                <button
                  type="button"
                  role="menuitem"
                  aria-current={active ? "true" : undefined}
                  className="pp-lang__option"
                  data-active={active ? "true" : undefined}
                  onClick={() => choose(code)}
                >
                  <span>{LOCALE_LABELS[code]}</span>
                  {active ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
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
