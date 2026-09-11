"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Globe } from "lucide-react";

import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Language selector for the landing screen.
 *
 * The landing page carries no navbar, so it cannot reuse the marketing
 * switcher — whose styles are scoped to the `.army-site` shell. This is the
 * same behaviour (write the cookie via the server action, then hard-reload so
 * every server component re-renders) in a single unobtrusive chip, kept
 * because `/` is the only page a first-time visitor sees before signing in.
 */
export function LandingLanguageSwitcher() {
  const { locale, t } = useI18n();
  const selectLanguage = t.publicSite.chrome.selectLanguage;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement | null>(null);

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
      window.location.reload();
    });
  }

  return (
    <div className="pats-landing__lang" ref={rootRef}>
      <button
        type="button"
        className="pats-landing__lang-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={selectLanguage}
        title={LOCALE_LABELS[locale]}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
      >
        <Globe className="pats-landing__lang-icon" aria-hidden strokeWidth={1.75} />
        <span>{locale.toUpperCase()}</span>
      </button>

      {open ? (
        <ul className="pats-landing__lang-menu" role="menu" aria-label={selectLanguage}>
          {LOCALES.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="none">
                <button
                  type="button"
                  role="menuitem"
                  aria-current={active ? "true" : undefined}
                  className="pats-landing__lang-option"
                  data-active={active ? "true" : undefined}
                  onClick={() => choose(code)}
                >
                  <span>{LOCALE_LABELS[code]}</span>
                  {active ? (
                    <Check className="pats-landing__lang-check" aria-hidden />
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
