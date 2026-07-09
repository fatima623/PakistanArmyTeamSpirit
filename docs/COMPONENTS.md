# Canonical components — use X, never Y

One component per concept. If you need a nav, hero, card, button, table, or
form field, it is on this list. Building a second implementation of anything
here is a defect (see REMEDIATION-PLAN.md Phase 2). Style with Tailwind
utilities + the tokens below — never a new `.css` file (enforced by
`npm run guardrails`).

## Design tokens (single source of truth)

| Layer | Where | Use for |
|---|---|---|
| Brand scale `--brand-*` | `src/app/globals.css` `:root` | Fixed brand colors (`bg-brand-night`, `text-brand-ink`, `border-brand-line`, …). RGB triplets — opacity modifiers work: `bg-brand-night/75`. |
| Semantic tokens | same block (`--background`, `--card`, `--primary`, …) | Theme-aware UI (`bg-background`, `text-muted-foreground`, …) — flips with day/night automatically. |

The legacy `army-*`, `tactical-*`, `portal-*`, `cp-*` Tailwind namespaces are
**deleted**. The guardrail fails the build if they reappear.

## Site chrome

| Concept | ✅ Use | ❌ Never |
|---|---|---|
| Public nav | `army/ArmyNavbar` | `cinematic/CinematicNav` (1 legacy usage, migrate away) |
| Public footer | `army/ArmyFooter` | `cinematic/CinematicFooter` (same) |
| Page shell (public) | `public/PublicLayout` → `CinematicShell` | hand-rolled wrappers |
| Page hero | `pats/PatsPageHero` | `army/HeroSlider` (home only, legacy) |
| Announcement ticker | `cinematic/AnnouncementTicker` | — |
| Portal nav/header | `pats/PatsPortalNavServer` + `pats/PatsPortalHeader` | — |
| Admin header | `admin/AdminHeader` | — |

## Primitives (`src/components/ui/` — shadcn)

| Concept | ✅ Use |
|---|---|
| Button | `ui/button` (variants via CVA — add variants there, don't fork) |
| Card / panel | `ui/card` |
| Dialog / confirm | `ui/dialog`, `ui/alert-dialog`, `ui/ConfirmDialog` |
| Form field | `ui/FormField` + `ui/input` / `ui/select` / `ui/textarea` / `ui/checkbox` / `ui/radio-group` / `ui/switch` |
| Country picker | `ui/CountrySelect` |
| Badge / status | `ui/badge` |
| Tooltip | `ui/tooltip` |
| Toast | `sonner` via `components/ClientToaster` |
| Skeleton | `ui/skeleton` |

## Rules of thumb

1. Check this file before building anything visual.
2. New variant? Extend the canonical component (CVA variant, prop) — never copy it.
3. Colors come from tokens. Raw hex in a component fails the guardrail ratchet.
4. A page-specific look is a composition of canonical parts + Tailwind
   utilities in the page file — never a new stylesheet.
