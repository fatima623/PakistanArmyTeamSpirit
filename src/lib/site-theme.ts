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

export function siteThemeCookieValue(theme: SiteTheme): string {
  return `${SITE_THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}
