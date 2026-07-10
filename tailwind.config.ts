import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Class-string helpers (admin-ui.ts, filter-chip-tones.ts, …) build
    // Tailwind class lists used across the admin. Without this glob their
    // unique utilities (e.g. bg-slate-600, p-1.5, min-h-[2.125rem]) are never
    // generated, silently collapsing filter-chip padding and active states.
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fixed brand palette — ONE namespace, backed by the --brand-* scale
        // in globals.css :root (single source of truth; Phase 1 of
        // REMEDIATION-PLAN.md). RGB-triplet vars so /opacity modifiers work.
        brand: {
          night: "rgb(var(--brand-night) / <alpha-value>)",
          "night-2": "rgb(var(--brand-night-2) / <alpha-value>)",
          olive: "rgb(var(--brand-olive) / <alpha-value>)",
          "olive-dark": "rgb(var(--brand-olive-dark) / <alpha-value>)",
          brass: "rgb(var(--brand-brass) / <alpha-value>)",
          khaki: "rgb(var(--brand-khaki) / <alpha-value>)",
          "khaki-warm": "rgb(var(--brand-khaki-warm) / <alpha-value>)",
          sand: "rgb(var(--brand-sand) / <alpha-value>)",
          "sand-dim": "rgb(var(--brand-sand-dim) / <alpha-value>)",
          red: "rgb(var(--brand-red) / <alpha-value>)",
          ink: "rgb(var(--brand-ink) / <alpha-value>)",
          "ink-muted": "rgb(var(--brand-ink-muted) / <alpha-value>)",
          line: "rgb(var(--brand-line) / <alpha-value>)",
          parchment: "rgb(var(--brand-parchment) / <alpha-value>)",
          "parchment-2": "rgb(var(--brand-parchment-2) / <alpha-value>)",
          black: "rgb(var(--brand-black) / <alpha-value>)",
          "brass-deep": "rgb(var(--brand-brass-deep) / <alpha-value>)",
          gunmetal: "rgb(var(--brand-gunmetal) / <alpha-value>)",
          "gunmetal-2": "rgb(var(--brand-gunmetal-2) / <alpha-value>)",
          panel: "rgb(var(--brand-panel) / <alpha-value>)",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: "hsl(var(--destructive))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        portal: ["var(--font-inter)", "DM Sans", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "var(--font-dm)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "var(--font-dm)", "system-ui", "sans-serif"],
        display: ["var(--font-barlow)", "system-ui", "sans-serif"],
        condensed: [
          "var(--font-barlow)",
          "var(--font-geist)",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-jetbrains)", "var(--font-mono)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        mechanical: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backgroundImage: {
        "brand-grid":
          "linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)",
        "brand-vignette":
          "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)",
        "cinematic-hero-ltr":
          "linear-gradient(to right, rgba(13,15,14,0.88) 0%, rgba(13,15,14,0.5) 45%, rgba(13,15,14,0.15) 70%, transparent 100%)",
        "cinematic-hero-bottom":
          "linear-gradient(to top, rgba(13,15,14,0.9) 0%, rgba(13,15,14,0.35) 40%, transparent 72%)",
      },
      backgroundSize: {
        "grid-48": "48px 48px",
      },
      boxShadow: {
        "brand-soft":
          "0 1px 3px rgba(20, 26, 20, 0.08), 0 8px 24px rgba(20, 26, 20, 0.06)",
        "brand-soft-lg": "0 4px 24px rgba(20, 26, 20, 0.12)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
