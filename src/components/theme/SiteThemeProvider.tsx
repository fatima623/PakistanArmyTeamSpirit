"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  DEFAULT_SITE_THEME,
  pathnameAllowsThemeChoice,
  SITE_THEME_CHANGE_EVENT,
  SITE_THEME_STORAGE_KEY,
  siteThemeCookieValue,
  type SiteTheme,
} from "@/lib/site-theme";

type SiteThemeContextValue = {
  theme: SiteTheme;
  dayTheme: boolean;
  setTheme: (theme: SiteTheme) => void;
};

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

function applySiteThemeToDocument(theme: SiteTheme, persist = true) {
  const root = document.documentElement;
  root.dataset.siteTheme = theme;
  const isDay = theme === "day";
  root.classList.toggle("site-theme-day", isDay);
  root.classList.toggle("light-theme", isDay);

  // When the theme is *forced* (e.g. the participant portal is always light),
  // don't overwrite the visitor's saved site-wide preference.
  if (persist) {
    try {
      localStorage.setItem(SITE_THEME_STORAGE_KEY, theme);
    } catch {
      /* private mode */
    }
    document.cookie = siteThemeCookieValue(theme);
  }

  window.dispatchEvent(
    new CustomEvent(SITE_THEME_CHANGE_EVENT, { detail: { theme } })
  );
}

export function SiteThemeProvider({
  children,
  initialTheme = DEFAULT_SITE_THEME,
}: {
  children: ReactNode;
  initialTheme?: SiteTheme;
}) {
  const [theme, setThemeState] = useState<SiteTheme>(initialTheme);
  const pathname = usePathname();

  // The day/night switch is a home-page feature. Every other route — public
  // inner pages, auth, the participant portal, admin — is an institutional
  // light surface and renders day mode regardless of the site-wide preference
  // (which stays untouched, so returning home restores the visitor's choice).
  const forcedDay = !pathnameAllowsThemeChoice(pathname);
  const effectiveTheme: SiteTheme = forcedDay ? "day" : theme;

  useEffect(() => {
    applySiteThemeToDocument(effectiveTheme, !forcedDay);
  }, [effectiveTheme, forcedDay]);

  const setTheme = useCallback(
    (next: SiteTheme) => {
      setThemeState(next);
      // Off the home page the toggle is not rendered at all; if something else
      // sets the theme there, only the stored preference moves — the page keeps
      // rendering light until the visitor returns home.
      if (!forcedDay) {
        applySiteThemeToDocument(next);
      } else {
        try {
          localStorage.setItem(SITE_THEME_STORAGE_KEY, next);
        } catch {
          /* private mode */
        }
        document.cookie = siteThemeCookieValue(next);
      }
    },
    [forcedDay]
  );

  const value = useMemo(
    () => ({
      theme: effectiveTheme,
      dayTheme: effectiveTheme === "day",
      setTheme,
    }),
    [effectiveTheme, setTheme]
  );

  return (
    <SiteThemeContext.Provider value={value}>{children}</SiteThemeContext.Provider>
  );
}

export function useSiteTheme(): SiteThemeContextValue {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    throw new Error("useSiteTheme must be used within SiteThemeProvider");
  }
  return ctx;
}
