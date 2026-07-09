# PATS Portal — UI Architecture Remediation Plan

**Author:** architecture review · **Date:** 2026-07-09 · **Repo state:** commit `903d86b`

## The one-sentence diagnosis

The stack you asked for (TypeScript, Tailwind, Next.js App Router, Node) is all
present and the **TypeScript is genuinely good** (`strict: true`, 0 `any`, 0
`@ts-ignore`). The damage is entirely in the **styling layer**: Tailwind was
installed and then bypassed in favour of ~28,800 lines of hand-written **global**
CSS across **51 files**, stacked by load-order and **2,398 `!important`s**, plus
**3–4 half-finished redesigns** ("army" → "cinematic/tactical" → "pats" →
"portal/cp refresh" → "participant-panel v2") that were never deleted.

Because every stylesheet is global and pseudo-scoped by a giant prefix class
(`.admin-theme` appears 1,208×, `.army-site` 655×), **the last file to load with
the most `!important` wins**. That is the precise, mechanical reason that editing
one thing silently changes or breaks another.

> **This is NOT a rewrite.** The data model, auth, API routes and types are sound.
> This is a presentation-layer refactor executed as a *strangler migration*:
> freeze the mess, stand up single sources of truth, then convert page-by-page and
> delete each old stylesheet as its last consumer disappears.

### Trend since first scan (getting worse, not better)

| Metric | commit `c1075ed` | commit `903d86b` (now) |
|---|---:|---:|
| CSS files in `src/app` | 49 | **51** |
| Total CSS lines | 27,972 | **28,855** |
| `!important` | 2,385 | **2,398** |
| Distinct CSS vars | 387 | **406** |
| Overlapping color namespaces | 6 | 6 |

The latest two commits *added* `admin-payment-detail.css` (+394) instead of
reusing existing admin styles. The freeze in Phase 0 exists to stop exactly this.

---

## Guiding principles (apply to every phase)

1. **One source of truth per concept.** One nav, one footer, one hero, one card,
   one button, one table, one page-header, one token set. Everything else is
   deleted, not "kept for reference."
2. **Strangler, not big-bang.** Migrate one route at a time behind the existing
   structure. The app stays shippable after every step.
3. **No new global CSS.** New styling is Tailwind utilities + the `ui/` primitives.
   A `.css` file may only *shrink or disappear*, never grow.
4. **Tokens before pixels.** Colors/spacing/radii come from a single token set;
   components reference tokens, never raw hex.
5. **Delete on green.** After each deletion, `npm run build` must pass and the
   affected route must look unchanged. Commit per route so any regression is a
   one-route revert.

---

## Phase 0 — Freeze + free deletions (½–1 day, zero visual change)

Pure subtraction. Nothing here changes how the app looks; it only removes code
that is provably unreferenced. Do this first so later phases start smaller.

### 0.1 Institute the freeze (enforced, not aspirational)

- **No new `.css` file** under `src/app`.
- **No new `!important`.**
- **No new color namespace** in `tailwind.config.ts`.
- Add the guardrails from Phase 5 now (a failing CI check is what makes the freeze
  real). Until CI lands, put these three rules at the top of `.cursorrules`.

### 0.2 Delete dead stylesheets (imported nowhere — verified)

```
src/app/admin-settings-reference.css      # import removed in 903d86b; now orphaned
src/app/participant-workflow.css
src/app/payment-rejection-reason.css
```
≈ **417 lines**, zero references.

### 0.3 Delete dead components (0 references anywhere — verified)

```
src/components/admin/AdminRoleSelect.tsx
src/components/admin/RejectButton.tsx
src/components/admin/TickerMarqueePreview.tsx
src/components/army/ArmyButton.tsx
src/components/army/ArmyFooterAsync.tsx
src/components/army/ArmyHomeTickerAsync.tsx
src/components/awards/AwardMedalLightbox.tsx
src/components/cinematic/CinematicPage.tsx
src/components/cinematic/CinematicPageHero.tsx
src/components/cinematic/CinematicSection.tsx
src/components/cinematic/Reveal.tsx
src/components/cinematic/SectionHeading.tsx
src/components/cinematic/TacticalCard.tsx
src/components/cinematic/TacticalGridOverlay.tsx
src/components/dashboard/LogoutButton.tsx
src/components/dashboard/ParticipantDashboardFlow.tsx
src/components/dashboard/ParticipantJourneyStepper.tsx
src/components/dashboard/RegistrationStatusCard.tsx
src/components/dashboard/TeamMembersDashboardCard.tsx
src/components/forms/registration/RegistrationWizard.tsx
src/components/forms/registration/RegistrationWizardContext.tsx   # only used by RegistrationWizard — delete together
src/components/pats/ParticipantPortalFooter.tsx
src/components/pats/PatsMissionBanner.tsx
src/components/public/PublicFooter.tsx
src/components/public/PublicHeader.tsx     # NOTE: edited in 903d86b despite being dead — proof edits are landing on unused files
src/components/team/TeamMembersPanel.tsx
```
≈ **1,400+ lines** of dead TSX. (An entire dead registration wizard lives here.)

> ⚠️ `ParticipantDashboardFlow` / `RegistrationStatusCard` import
> `payment-status-timeline.css`, which is still used by live components — delete
> the **component** now, but leave that CSS until Phase 3c.

### 0.4 Repo hygiene

```
rm netstat taskilll            # empty junk files committed by accident
git mv .curosrrules .cursorrules   # misspelled; Cursor never reads the current name
```
Also fold `DESIGN_SPEC.md`, `HANDOFF*.md`, `WORKFLOW*.md`, `approval_flow.md`,
`USER_DATABASE_REPORT.md` into a `/docs` folder (cosmetic, do opportunistically).

**Phase 0 exit:** `npm run build` green, app visually identical, ~1,800 LOC gone,
freeze enforced.

---

## Phase 1 — Collapse to one token system ✅ IMPLEMENTED

Done: `--brand-*` scale (20 RGB-triplet tokens) defined once in
`globals.css :root`; all six legacy namespaces (`army`, `tactical`, `portal`,
`cp`, `bg-*/accent-*`, plus unused images/shadows/animations) deleted from
`tailwind.config.ts`; 440 usages codemodded across 51+ files (tsx + css
selectors + `@apply` lines + compound prefixes like `border-l-`),
exact-duplicate colors merged (tactical-olive ≡ cp-olive → `brand-olive`;
ops-red ≡ cp-alert → `brand-red`; void ≡ carbon → `brand-night`;
carbon-raised ≡ navy → `brand-night-2`). Used shadows kept as
`shadow-brand-soft(-lg)`. Guardrails extended: legacy namespace usage now
fails the build; tailwind.config hex count ratchets. Also fixed in passing: a
never-working hover/selected highlight in `ui/CountrySelect` that referenced
a class (`bg-cp-surface-muted`) defined nowhere. Original notes below.

### Original plan (superseded by implementation)

Today `tailwind.config.ts` defines **six** color namespaces for one green/gold/
parchment identity: `army.*`, `tactical.*`, `portal.*`, `cp.*`, the
`bg-*/accent-*` set, and the shadcn `hsl(var(--…))` set. Plus **406** distinct
`--vars` and **463** distinct hex literals in CSS. There is no single "brand green."

**Target:** one semantic token layer (the shadcn `hsl(var(--…))` set) driven by a
small brand scale, defined **once** in `:root` (night) and one override block
(day). ~15–20 tokens total.

1. Pick the **shadcn semantic tokens** as the public API components consume
   (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`,
   `text-muted-foreground`, `ring`, …). They already exist in `tailwind.config.ts`.
2. Define the raw brand scale once in `globals.css` `@layer base`:
   `--brand-green`, `--brand-green-dark`, `--brand-brass`, `--parchment`, `--ink`,
   and the `--background/--foreground/--card/...` HSL triples for night; repeat the
   HSL triples inside a single `:root.light-theme` / `[data-site-theme="day"]`
   block. **This one block replaces the day/night duplication of Phase 4.**
3. Build a mapping table old → new (e.g. `army-green`,`cp-olive`,`tactical-green`,
   `portal-primary` → `primary`) and run it as a find/replace codemod across
   `src/components/**` and `src/app/**` (utilities only — CSS files are handled in
   Phase 3 as each is deleted).
4. Once no code references `army.*`, `tactical.*`, `portal.*`, `cp.*`,
   `bg-*/accent-*`, **delete those namespaces** from `tailwind.config.ts`, leaving
   only the semantic set + `fontFamily` + a handful of real extras.

**Exit:** one palette; changing `--brand-green` in one place recolors the whole
app; `tailwind.config.ts` has a single color namespace.

---

## Phase 2 — Declare the single-source-of-truth components ✅ DECLARED

`docs/COMPONENTS.md` now lists the canonical component per concept and the
token layers. Physical consolidation of the remaining rivals (CinematicNav /
CinematicFooter / HeroSlider each have 1 legacy usage) happens alongside the
Phase 3 page migrations that touch them. Original table below.

### Original plan (superseded by docs/COMPONENTS.md)

Stand up (mostly by promoting the already-active one and deleting rivals) exactly
one canonical component per concept, each built from `src/components/ui/*` (shadcn)
+ Tailwind + Phase 1 tokens. **No canonical component imports a `src/app/*.css`.**

| Concept | ✅ Canonical (survivor) | ❌ Deleted / absorbed |
|---|---|---|
| Public nav | `army/ArmyNavbar` (already the live one) | `navigation/PatsNavigation`, `cinematic/CinematicNav`, `pats/PatsPortalNav`, `public/PublicHeader`* |
| Public footer | `army/ArmyFooter` (already live) | `cinematic/CinematicFooter`, `public/PublicFooter`*, `pats/ParticipantPortalFooter`* |
| Page shell | `cinematic/CinematicShell` (already live) | `cinematic/CinematicPage`* |
| Page hero | `pats/PatsPageHero` (12 usages — most used) | `hero/PatsHero`, `cinematic/CinematicPageHero`*, `army/HeroSlider` (keep only if home uses it) |
| Portal nav/header | `pats/PatsPortalNavServer` + `pats/PatsPortalHeader` | consolidate the two into one |
| Admin header | `admin/AdminHeader` | — (already single) |
| Card | `ui/card` | all bespoke `.*-card` CSS blocks |
| Button | `ui/button` (add CVA variants: `military`, `brass`) | `army/ArmyButton`*, every `.army-btn`/`.tac-btn`/`.pp-btn` class |
| Table | one `ui/DataTable` (build from `ui/` primitives) | `.tac-admin-table`, `.team-members__table`, `.admin-*-reference` table CSS |
| Form field | `ui/FormField` + `ui/input`/`ui/select`/`ui/textarea` | scattered per-form CSS |
| Page header (admin) | one `admin/PageHeader` | `admin-typography.css` header rules |

\* already deleted in Phase 0.

Deliverable: a short `docs/COMPONENTS.md` listing "use X, never Y" so the junior
has one place to look — this directly fixes "changes only apply to one thing."

**Exit:** every remaining page can be built from this list; rivals are gone.

---

## Phase 3 — Page-by-page strangler migration (the bulk, 2–4 weeks)

For **each** route: swap bespoke markup for the Phase-2 canonical components +
Tailwind utilities, remove the `import "@/app/*.css"` line, verify the route looks
unchanged, then **delete the now-orphaned CSS file** and commit.

Do it in this order — most isolated first (admin reference sheets are the cleanest
"one file per page" units), most entangled (the shared global `pats-*` design
system) last.

### 3a. Admin section — per-page CSS, delete in this order

Each file is gated by migrating its listed route(s) first:

| Delete after migrating… | CSS file to delete |
|---|---|
| `admin/gallery` | `admin-gallery.css` |
| `admin/key-dates` | `admin-key-dates-reference.css` |
| `admin/units` | `admin-units-reference.css` |
| `admin/news` (+ `news/new`, `news/[id]/edit`) | `admin-news-reference.css` |
| `admin/ticker` (+ `ticker/new`, `ticker/[id]/edit`) | `admin-ticker-reference.css` |
| `admin/payments/[id]` | `admin-payment-detail.css` |
| `admin/payments` + `admin/tickets` (shared) | `admin-payments-reference.css` |
| `admin/users` + `user-management` + `news` + `tickets` (shared by 4) | `admin-users-reference.css` |
| `users/[id]` + `news new/edit` + `ticker new/edit` + `settings` + `payments/[id]` + `tickets/[id]` (shared by many) | `admin-user-detail.css` |
| all admin pages migrated | `admin-typography.css`, then `admin-day-theme.css` (→ Phase 4) |

Note the two "shared by many" sheets (`admin-users-reference`, `admin-user-detail`)
can only be deleted once **every** listed consumer is migrated — schedule them last
within 3a.

### 3b. Participant portal / dashboard

Migrate the `event/*` routes and the portal shell, then delete in order:
```
participation-confirm.css        # after ParticipationConfirmCard
participant-portal-day.css       # after portal pages (folds into Phase-1 day tokens)
participant-panel.css            # the "pp" v2 system — after portal fully on ui/*
participant-dashboard.css
pats-portal.css
portal-design.css
```
Then drop the legacy shell classes in `src/app/(dashboard)/layout.tsx`
(`pats-portal participant-portal dashboard-day pp`) down to a single wrapper.

### 3c. Payment timeline (shared leaf)

`payment-status-timeline.css` is imported by 8 places (several deleted in Phase 0).
Migrate `PaymentStatusTimeline`, `PaymentSubmissionForm`, `PaymentReviewPanel`,
`ParticipationConfirmCard`, `event/dashboard`, `event/payment`, `admin/payments/[id]`
to the canonical card/timeline, then delete the file.

### 3d. Public marketing + global design system (LAST — most entangled)

These are globally `@import`-ed into `globals.css` and share the `.army-site` /
`.pats-*` / `.cinematic-site` prefixes, so they can only go once the pages that
depend on them are migrated. Delete in this dependency order (leaves → roots):

```
tac-mission-card.css, tac-edition-timeline.css, forest-card-carousel.css,
pats-forest-cards.css, pats-mission-showcase.css, pats-awards-showcase.css,
pats-video-gallery.css, pats-section-panels.css, pats-section-spacing.css,
pats-card-surface.css, pats-zebra.css, team-members.css, event-support.css,
exercise-contour.css, pats-home-day.css, pats-inner-pages.css, pats-hero.css,
pats-footer-viewport.css, pats-site-chrome.css, pats-navigation.css,
pats-motion.css, pats-responsive.css, pats-typography.css,
   → then the "design-system" roots:
army-design.css, cinematic-tactical.css, paf-theme.css, pats-design-system.css,
pats-refresh.css, daylight-theme.css
   → finally globals.css shrinks to: @tailwind directives + ~20 token lines.
```

**Exit for Phase 3:** `src/app` contains **one** CSS file (`globals.css`, a few
hundred lines of tokens + Tailwind directives). `grep -r '!important' src/app`
returns ~0.

---

## Phase 4 — Kill day/night duplication (folds into Phase 1)

The day theme is currently implemented as overrides spread across **25 files**
(`daylight-theme.css`, `admin-day-theme.css`, `participant-portal-day.css`,
`pats-home-day.css`, …) fighting the night rules with `!important`. Once Phase 1
lands, day/night is **one token override block** (`:root` vs `.light-theme`),
Tailwind's `dark:` variants, and nothing else. Every `*-day.css` file is deleted
here as part of Phase 3's deletions. No component should branch on theme in JS
except the toggle itself.

---

## Phase 5 — Guardrails so it can't regress ✅ IMPLEMENTED

Implemented as `scripts/css-guardrails.mjs` + committed baseline
(`scripts/css-guardrails-baseline.json`). Runs automatically at the front of
`npm run dev`, `npm run build`, and `npm run lint` — a violation stops all three.

Rules enforced (ratchet: numbers may only go DOWN):
1. **No new `.css` file** anywhere under `src/` (baseline file list).
2. **No new `!important`** (total count vs baseline, offending files named).
3. **No new `import "*.css"`** in any `.ts`/`.tsx` (baseline import pairs).
4. **No new raw hex colors** in `.tsx` (count vs baseline).

Workflow: after deleting CSS / removing `!important`, run
`npm run guardrails:update` and commit the shrunken baseline to lock in the win.

Still to add after Phase 1: grep-fail on the dead Tailwind namespaces
(`army-`, `tactical-`, `portal-`, `cp-`). Keep `strict: true` / zero-`any`
discipline (already good).

---

## Suggested sequencing & effort

| Phase | What | Effort | Risk |
|---|---|---|---|
| 0 | Freeze + delete dead code + hygiene | ½–1 day | none (pure delete) |
| 1 | One token system | 1–2 days | low |
| 2 | Canonical components declared | 2–3 days | low |
| 3 | Page-by-page migration + CSS deletion | 2–4 weeks | medium, isolated per route |
| 4 | Day/night → token swap | folds into 1+3 | low |
| 5 | CI guardrails | ½ day | none |

**Do Phase 0 and Phase 5's checks this week.** They stop the bleeding immediately
and cost almost nothing. Phase 1 is the keystone — until there is one token set,
Phase 3 migrations have nothing stable to point at.

---

## Definition of done

- `src/app` has exactly one stylesheet (`globals.css`), a few hundred lines.
- `tailwind.config.ts` has one color namespace.
- `grep -rc '!important' src/app` ≈ 0.
- One nav, one footer, one hero, one card, one button, one table, one form field.
- Changing `--brand-green` (or any token) in one place updates the entire app.
- CI blocks any new `.css` file, `!important`, or raw hex in components.
