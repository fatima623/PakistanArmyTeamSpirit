"use client";

import { Moon, Sun } from "lucide-react";

import { useSiteTheme } from "@/components/theme/SiteThemeProvider";
import { cn } from "@/lib/utils";
import type { SiteTheme } from "@/lib/site-theme";

type Props = {
  className?: string;
};

export function SiteThemeToggle({ className }: Props) {
  const { theme, setTheme } = useSiteTheme();

  const select = (next: SiteTheme) => {
    if (next === theme) return;
    setTheme(next);
  };

  return (
    <div className={cn("pats-nav__theme", className)}>
      <div
        className="pats-nav__theme-switch"
        data-active={theme}
        role="group"
        aria-label="Site theme"
      >
        <span className="pats-nav__theme-thumb" aria-hidden />
        <button
          type="button"
          className={cn(
            "pats-nav__theme-btn",
            theme === "day" && "pats-nav__theme-btn--active"
          )}
          aria-pressed={theme === "day"}
          aria-label="Day theme"
          title="Day theme"
          onClick={() => select("day")}
        >
          <Sun className="pats-nav__theme-icon" aria-hidden strokeWidth={2} />
        </button>
        <button
          type="button"
          className={cn(
            "pats-nav__theme-btn",
            theme === "night" && "pats-nav__theme-btn--active"
          )}
          aria-pressed={theme === "night"}
          aria-label="Night theme"
          title="Night theme"
          onClick={() => select("night")}
        >
          <Moon className="pats-nav__theme-icon" aria-hidden strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
