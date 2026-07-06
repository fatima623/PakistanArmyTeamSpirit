import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-base": "var(--bg-base, #0A0A0A)",
        "bg-surface": "var(--bg-surface, #111111)",
        "bg-card": "var(--bg-card, #161616)",
        "accent-primary": "var(--accent-primary, #2D5A1B)",
        "accent-gold": "var(--accent-gold, #C9A84C)",
        "text-label": "var(--text-label, #C9A84C)",
        army: {
          green: "#01411C",
          olive: "#1A2A1A",
          charcoal: "#0D1117",
          steel: "#1E2A35",
          gold: "#C9A84C",
          cream: "#F5F0E8",
        },
        tactical: {
          void: "#0D0F0E",
          carbon: "#0D0F0E",
          "carbon-raised": "#121614",
          navy: "#121614",
          slate: "#161d19",
          panel: "#1a221e",
          green: "#2a3d28",
          olive: "#3d5230",
          brass: "#C5A880",
          "brass-dim": "#8B9676",
          khaki: "#8B9676",
          sand: "#EBEBEB",
          "sand-dim": "#8a8272",
          "ops-red": "#8b3a2a",
          alert: "#B8860B",
          mist: "#EBEBEB",
        },
        portal: {
          primary: "var(--portal-primary, #4a5e3a)",
          "primary-hover": "var(--portal-primary-hover, #3d4f30)",
          approve: "var(--portal-approve, #2e6b4f)",
          "approve-hover": "var(--portal-approve-hover, #245a40)",
          destructive: "var(--portal-destructive, #c0392b)",
        },
        cp: {
          gunmetal: "#141a14",
          "gunmetal-light": "#1e2720",
          olive: "#3d5230",
          "olive-dark": "#2f4025",
          "olive-light": "#4d6340",
          brass: "#b8941f",
          "brass-light": "#d4b24a",
          khaki: "#8a9478",
          parchment: "#f3efe6",
          "parchment-dark": "#e6e0d4",
          ink: "#1c2119",
          "ink-muted": "#4a5245",
          border: "#c8c2b4",
          alert: "#8b3a2a",
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
      letterSpacing: {
        military: "0.14em",
        "wide-xl": "0.2em",
      },
      transitionTimingFunction: {
        mechanical: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backgroundImage: {
        "cp-hero":
          "linear-gradient(135deg, rgba(20,26,20,0.92) 0%, rgba(61,82,48,0.75) 50%, rgba(20,26,20,0.88) 100%)",
        "cp-stripe":
          "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(184,148,31,0.06) 4px, rgba(184,148,31,0.06) 8px)",
        "tactical-grid":
          "linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)",
        "tactical-vignette":
          "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)",
        "tactical-hero":
          "linear-gradient(180deg, rgba(8,11,10,0.72) 0%, rgba(8,11,10,0.88) 40%, rgba(8,11,10,0.97) 100%)",
        "cinematic-hero-ltr":
          "linear-gradient(to right, rgba(13,15,14,0.88) 0%, rgba(13,15,14,0.5) 45%, rgba(13,15,14,0.15) 70%, transparent 100%)",
        "cinematic-hero-bottom":
          "linear-gradient(to top, rgba(13,15,14,0.9) 0%, rgba(13,15,14,0.35) 40%, transparent 72%)",
        "tac-semantic-grid":
          "linear-gradient(rgba(197,168,128,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(197,168,128,0.06) 1px, transparent 1px)",
        "tac-fog-radial":
          "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(61,82,48,0.2), transparent 55%)",
        "tac-brief-grid":
          "linear-gradient(rgba(201,162,39,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-48": "48px 48px",
        "brief-24": "24px 24px",
      },
      keyframes: {
        "tac-scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "tac-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "tac-scan": "tac-scan 9s ease-in-out infinite",
        "tac-glow": "tac-glow 3s ease-in-out infinite",
      },
      boxShadow: {
        "tac-glow": "0 0 40px rgba(201, 162, 39, 0.15)",
        "tac-card": "0 20px 50px rgba(0, 0, 0, 0.45)",
        cp: "0 1px 3px rgba(20, 26, 20, 0.08), 0 8px 24px rgba(20, 26, 20, 0.06)",
        "cp-lg": "0 4px 24px rgba(20, 26, 20, 0.12)",
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
