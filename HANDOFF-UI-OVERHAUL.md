# PATS — UI Overhaul Handoff

> **Scope of this document:** the design-refresh + mockup-match work done in this
> session. It documents *what changed, why, how it's wired, what's verified, and
> what's left*. The general project handoff (app overview, tech stack, domain
> workflow) lives in `HANDOFF.md` — this file is additive and does not replace it.
>
> **Status:** Admin console + participant portal re-skinned and matched to the two
> client mockups. `npx tsc --noEmit` and `npx next lint` are clean across all
> changed files. All screens were verified live in the browser (admin + participant).

---

## 1. What this session delivered

1. **Institutional re-skin** of the admin console and participant portal
   (indigo/slate "CRM SaaS" look → **olive-green + brass + sage institutional**,
   paf.gov.pk-inspired), driven by a single CSS override layer.
2. **Hydration errors fixed** on admin + portal surfaces.
3. **Participant portal converted to the light institutional look** (dark sidebar
   rail, sage canvas, white cards) — previously it rendered in night mode.
4. **Every admin + portal screen matched to the client mockups** (see §5).
5. **Payment methods changed** (feature, not just styling): EasyPaisa/JazzCash
   removed; **Bank wire transfer, Wise, Mobile wallets, Remitly** added — full
   stack incl. a DB migration (applied).

**Mockup source of truth** (client-provided, used for the match):
`C:\Users\fatim\Downloads\Client demonstration UI overhaul1\standalone-html\`
→ `PATS Admin Panel.html`, `PATS Participant Portal.html`
(These were temporarily served from `public/mockups/` during the work and have
since been **deleted** — they must not ship.)

---

## 2. Core architecture — how the re-skin is wired

### 2a. `src/app/pats-refresh.css` (the override layer) — **new file**
The whole re-skin is a **CSS override layer** that targets the *same class names*
the components already emit (`.admin-theme`, `.admin-sidebar-link`,
`.admin-stat-card--*`, `.ops-status-pill`, `.admin-users-table`, …) and overrides
the shipped `src/app/admin-day-theme.css` (an indigo/slate skin that uses
`!important` throughout).

- Imported **last** in `src/app/globals.css` (after `./event-support.css`) so it
  wins the cascade.
- Organised by numbered section comments. Notable sections:
  - **§1–§11** — original shipped refresh (tokens, sidebar, header, KPI cards,
    tables, status pills, buttons, inputs, the officer-name alignment fix, light
    portal parity).
  - **§12 — scoped `cp-*` remap.** Instead of editing the global Tailwind `cp`
    palette (which would bleed into the *public* marketing site — 6 public files
    use `cp-*`), the `cp-*` utilities are remapped **only** under `.admin-theme`
    and the portal wrappers. **`tailwind.config.ts` was intentionally NOT changed.**
  - **§13** — sidebar role badge, header breadcrumb / "Live" pill / notifications bell.
  - **§14 — specificity hardening.** `src/app/pats-portal.css` has an
    "Admin shell light theme" block (`.admin-theme.pats-dashboard aside[class*="sidebar"]`,
    specificity 0,3,1 `!important`) that forced the sidebar white and out-ranked
    the drop-in layer. §14 re-asserts the dark rail with matching selectors so it
    wins by load order. **If the admin sidebar ever renders white again, this is why.**
  - **§15** — portal light institutional (sage canvas, dark sidebar rail, brass accents).
  - **§17–§24** — per-screen mockup layouts: participation-requests table,
    participating-teams card grid, portal journey stepper, portal vertical timeline,
    admin support-tickets card list, user-management role/status pills, news card
    list, announcements "Live preview" bar.

> **To fully revert the re-skin:** delete the single `@import "./pats-refresh.css";`
> line in `globals.css`. All component edits are additive and harmless without it.

### 2b. Portal light-mode forcing
The portal has a full, tested **day theme** (`participant-portal-day.css`, gated on
`html[data-site-theme="day"]`) that was inactive because the site default is night.
Rather than hand-override night mode, the portal now **forces day mode on its routes**:
- `src/components/theme/SiteThemeProvider.tsx` — forces `day` when
  `pathnameIsParticipantPortalApp(pathname)` is true; the visitor's site-wide
  preference is **not** persisted/overwritten (added a `persist` flag).
- `src/app/layout.tsx` — the inline theme-bootstrap script also forces `day` on
  portal routes at first paint (no flash). `<html>` already has
  `suppressHydrationWarning`, so the attribute swap is hydration-safe.
- Result: portal routes render light; **public marketing pages are unaffected**
  (verified: `/` still night). Reverts to the user's theme when leaving the portal.

### 2c. Hydration fix
Three root-level effects mounted in `Providers` mutate classNames document-wide and
raced React's progressive hydration on admin/portal cards:
- `src/components/motion/GlobalMotionEffects.tsx` — now **skips app surfaces**
  (`/admin*` and portal routes via `isAppSurface`). Marketing scroll-reveal no
  longer runs on functional app pages.
- `src/components/effects/AmbientSectionEffects.tsx` — its DOM mutation
  (`hover-lift-card`, parallax) is now **deferred to `requestIdleCallback`**
  (after hydration). Hover/scroll enhancements have no first-paint state, so this
  is visually invisible.
- Verified via clean-room dev-server restart: admin + portal produce **zero**
  hydration errors. The remaining ones are all **public marketing pages** (home,
  login) — left intact because deferring their scroll-reveal would flash content.

---

## 3. Payment methods feature (Bank wire / Wise / Mobile wallets / Remitly)

Full-stack change; **additive/non-destructive** DB migration.

- **Schema** (`prisma/schema.prisma`, `SiteSettings`): added
  `paymentWiseEmail`, `paymentWiseName`, `paymentMobileNumber`, `paymentMobileTitle`,
  `paymentRemitlyEmail`, `paymentRemitlyName` (all `String @default(...)`).
  The legacy `paymentEasypaisa*` / `paymentJazzcash*` columns were **kept**
  (unused) so the migration only *adds* columns — no data loss.
- **Migration:** `prisma/migrations/20260701130000_payment_methods_intl/migration.sql`
  (hand-written, `ALTER TABLE ... ADD COLUMN` only).
  - **⚠ Applied to the local DB via `npx prisma db execute --file <sql> --schema prisma/schema.prisma`.**
    `npx prisma migrate deploy` fails with **P3005** because this DB was created
    with `db push` (no migration history / no `_prisma_migrations` baseline).
    For any *other* environment, apply the SQL directly (`db execute`) or
    `prisma db push`, **not** `migrate deploy`, until the DB is baselined.
- **Rest of the stack:**
  - `src/lib/payment-settings.ts` — type/defaults/select/mapping swapped.
  - `src/lib/validations.ts` — `SiteSettingsSchema` payment fields swapped.
  - `src/components/dashboard/PaymentInstructions.tsx` — renders the 4 methods.
  - `src/components/dashboard/PaymentSubmissionForm.tsx` — helper copy updated.
  - `src/components/admin/SettingsForm.tsx` — admin editor fields swapped.
  - The settings API (`src/app/api/admin/settings/route.ts`) needed **no change**
    (it spreads validated data).

---

## 4. Files changed

**New files**
- `src/app/pats-refresh.css` — the override layer (core artifact)
- `src/components/admin/AdminExportButton.tsx` — client-side CSV export
- `src/components/dashboard/ParticipantJourneyStepper.tsx` — portal dashboard stepper
- `src/components/timeline/PortalTimeline.tsx` — portal vertical timeline
- `prisma/migrations/20260701130000_payment_methods_intl/migration.sql`
- `.claude/launch.json` — dev-server config for the preview tool (harmless; can stay)

**Modified — global / theme**
- `src/app/globals.css` (imports pats-refresh.css last)
- `src/app/layout.tsx` (inline script forces portal day mode)
- `src/components/theme/SiteThemeProvider.tsx` (force day on portal routes)
- `src/components/motion/GlobalMotionEffects.tsx`, `src/components/effects/AmbientSectionEffects.tsx` (hydration)

**Modified — admin**
- Pages: `(admin)/admin/{layout,page,users/page,payments/page,units/page,tickets/page,user-management/page,news/page,ticker/page}.tsx`
- Components: `AdminDashboardStats`, `AdminHeader`, `AdminLayout`, `AdminSidebar`, `AdminStatCard`, `IntlBadge`, `UsersManagementTable`, `UnitsTable`, `UserAccountsTable`, `SettingsForm`
- Lib: `admin-dashboard-charts.ts` (real KPI sparkline data)

**Modified — portal**
- Pages: `(dashboard)/event/{dashboard,timeline}/page.tsx`
- Components: `PatsPortalNav`, `PatsPortalNavServer`, `TeamMembersSection`, `tickets/{SupportTicketsPanel,NewTicketForm}`, `dashboard/{PaymentInstructions,PaymentSubmissionForm}`

**Modified — data model**
- `prisma/schema.prisma`, `src/lib/payment-settings.ts`, `src/lib/validations.ts`

---

## 5. Screen-by-screen status (all verified live)

| Surface | Screen | What it matches |
|---|---|---|
| Admin | Dashboard | 6 quick cards (4+2), 4 KPI cards w/ **real-data sparklines**, "Home /" breadcrumb, "Participant view" btn |
| Admin | Participation Requests | 5-col avatar table (PARTICIPANT/UNIT/APPLICATION/PAYMENT/ACTIONS), Export CSV, "Referred"/"Payment due" filters |
| Admin | Payment Verification | 6-col avatar table (+ Amount/Reference), "Manual verification" alert |
| Admin | Participating Teams | **card grid** — status pill, branch, captain block, member count, Export roster |
| Admin | Support Tickets | **card list** — TK-ref, priority pill, submitter avatar, time-ago, status |
| Admin | User Management | avatar table, role pill (Participant/SDBS/MTD/Admin) + account status pill, "Invite user" |
| Admin | News Management | **card list** — icon, title, date, PDF, Published/Draft pill |
| Admin | Announcements | **Live preview** ticker bar added; list reskinned (see residuals) |
| Admin | Key Dates | reskinned functional table |
| Admin | Site Settings | reskinned form + the new payment-method fields |
| Portal | Dashboard | **journey stepper** (Application→Payment→Confirmed) + sidebar **stage chip** |
| Portal | Team Members | avatar table (Member/Service#/Service Arm/Gender/Actions) |
| Portal | Timeline | **vertical journey timeline** (date · dot · title · Completed/Upcoming/Scheduled) |
| Portal | Payment | Bank wire / Wise / Mobile wallets / Remitly method cards |
| Portal | Support | icon rows, "New ticket" |
| Portal | Unit Information | reskinned form |
| Portal | Privacy | reskinned form |

---

## 6. Verification

- `npx tsc --noEmit` → 0 errors; `npx next lint` on changed files → clean (throughout).
- Verified in-browser as **admin** (`admin@example.com`) and as **participant**
  (`approved@example.com` / `TestPass123!`, a stage-2 "payment required" user).
  MTD (`mtd@example.com`) covers the Operations screens; admin is needed for
  User Management / News / Announcements / Key Dates / Site Settings.
- A full `next build` was **not** run — recommended before deploy.

---

## 7. Known items / residuals / TODO

- **Announcements & Key Dates** kept their **table** presentation (functional,
  reskinned) rather than the mockup's card/toggle layouts — a full rebuild of those
  large inline-editing client components (`TickerManager` 423 lines, `KeyDatesManager`
  348 lines) was judged too risky for the value. Announcements *did* get the
  signature **Live preview** ticker bar. These are the only screens not at 1:1.
- **Payment fee shows "$ 15"** on the portal — that's DB `SiteSettings` singleton
  data (`paymentCurrency = "$"`, `defaultPaymentAmount = 15`), editable in Site
  Settings; not a code issue.
- **Test data:** a team member "Capt Sara Khan" was added to `approved@example.com`
  while verifying the Team Members table — harmless dev data, delete if unwanted.
- **Migration baseline:** consider baselining the DB into Prisma's migration history
  so `migrate deploy` works going forward (currently `db push`-based).
- **Public marketing pages** still have pre-existing scroll-reveal hydration warnings
  (out of scope; fixing risks a content-flash). Not addressed.
- Recommended: run a full `next build`, then commit the working tree (current
  commit messages are placeholders per the general HANDOFF).

---

## 8. Gotchas for whoever picks this up

- **Don't edit `tailwind.config.ts` `cp` palette** to change admin/portal colors —
  it bleeds into the public site. Use the scoped remap in `pats-refresh.css` §12.
- **Sidebar/header must beat `pats-portal.css`** ("Admin shell light theme",
  specificity 0,3,1 `!important`). Keep §14's matching selectors.
- **DB migrations are not auto-run** (project convention): edit schema →
  `npx prisma generate` (stop the dev server first on Windows — it locks the query
  engine) → hand-write SQL → apply with `db execute`/`db push` (this DB isn't
  baselined for `migrate deploy`).
- Portal is now **forced to day mode** on its routes; if you add a new portal route,
  add its prefix to `src/lib/participant-portal-paths.ts` (also required so the
  public nav/marquee stay hidden).
- On Windows dev, a `__webpack_modules__[moduleId] is not a function` /
  "Loading chunk failed" after adding files is a stale build — `rm -rf .next` and
  restart, it's not a code bug.
