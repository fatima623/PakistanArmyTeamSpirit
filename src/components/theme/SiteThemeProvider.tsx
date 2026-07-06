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
  SITE_THEME_CHANGE_EVENT,
  SITE_THEME_STORAGE_KEY,
  siteThemeCookieValue,
  type SiteTheme,
} from "@/lib/site-theme";
import { pathnameIsParticipantPortalApp } from "@/lib/participant-portal-paths";

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

  // The participant portal is an institutional light surface — force day mode on
  // its routes regardless of the site-wide preference (which stays untouched).
  const forcedDay = pathnameIsParticipantPortalApp(pathname);
  const effectiveTheme: SiteTheme = forcedDay ? "day" : theme;

  useEffect(() => {
    applySiteThemeToDocument(effectiveTheme, !forcedDay);
  }, [effectiveTheme, forcedDay]);

  const setTheme = useCallback(
    (next: SiteTheme) => {
      setThemeState(next);
      // On forced-day routes the toggle only updates the stored preference; the
      // portal keeps rendering light until the visitor navigates away.
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
