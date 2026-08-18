export const SITE_THEME_COOKIE = "pats-site-theme";
export const SITE_THEME_STORAGE_KEY = "pats-site-theme";
export const SITE_THEME_CHANGE_EVENT = "pats-site-theme-change";

export type SiteTheme = "day" | "night";

export const DEFAULT_SITE_THEME: SiteTheme = "night";

export function parseSiteTheme(value: string | null | undefined): SiteTheme {
  return value === "day" ? "day" : "night";
}

export function isDaySiteTheme(theme: SiteTheme): boolean {
  return theme === "day";
}

/**
 * The day/night switch is a HOME PAGE feature. Every other route — public
 * inner pages, auth, the participant portal, admin — renders the light theme
 * regardless of the stored preference.
 *
 * This is the single source of truth for that rule: the root layout, the
 * pre-paint bootstrap script and the provider all key off it, so a route can
 * never end up with the server and the client disagreeing about the theme.
 */
export function pathnameAllowsThemeChoice(pathname: string): boolean {
  return pathname === "/";
}

/** The theme a given route must render in, given the stored preference. */
export function themeForPathname(
  pathname: string,
  preference: SiteTheme
): SiteTheme {
  return pathnameAllowsThemeChoice(pathname) ? preference : "day";
}

export function siteThemeCookieValue(theme: SiteTheme): string {
  return `${SITE_THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}
