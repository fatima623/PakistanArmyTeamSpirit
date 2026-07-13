> ✅ **STATUS UPDATE (2026-07-13):** All of PART B (tasks 1–8, Phases 1–6) are **implemented and verified**.
> Decisions resolved: Q1 = reuse `NewsPost` for Announcements (marquee now sources it); Q2 = connected `D:\ProjectManagementSystem` (world.svg + flags copied); Q3 = existing `/media/pats/pats-logo.webp` crest.
> New code is type-clean, eslint-clean, css-guardrails-clean, and browser-verified (events, announcements, marquee, map, nav).
> Known pre-existing (NOT from this work): 12 tsc errors in `PaymentActions`/`PaymentReviewPanel`/`RegistrationActions` (narrow lucide icon prop type) block `next build`; a logo/scroll hydration warning on public pages. Admin CRUD UIs are type-clean + mirror the gallery pattern but should be exercised via a real admin login.
> Details of what changed are in the assistant's final message for that session.

# PATS Portal — Session Handoff Document

> Purpose: Full context handoff so this work can continue in a fresh session or another tool without re-discovery. Covers (A) completed i18n work, (B) a new large set of requested tasks, all codebase findings, 3 open decisions, and a phased implementation plan.

Project root (workspace): `D:\PakistanArmyTeamSpirit`
Stack: **Next.js 15 (App Router)** + **Prisma** + **NextAuth v5 beta** + Tailwind. Server components heavily used. Package name: `pats-portal`.

Build guardrails (important): `scripts/css-guardrails.mjs` runs on build/lint and RATCHETS:
- No NEW `.css` files under `src/`
- `!important` count may not increase
- No NEW `import "*.css"`
- Raw hex-color literal count in `.tsx` may not increase
→ When adding styles, prefer editing `src/app/globals.css`, avoid new `!important`, avoid hex literals in `.tsx`.

Type-check: `npx tsc --noEmit -p tsconfig.check.json` (full check is slow, >45s; run in background and poll). Lint: `npx eslint <paths>`.

---

## PART A — COMPLETED THIS SESSION: Participant-portal i18n (EN/RU/TR/AR + RTL)

Status: **DONE and verified** (type-check clean, lint clean, css-guardrails pass). Not yet runtime-tested in a browser.

What was built — a cookie-based internationalization system for the **participant portal** (`/event/*`), with a language switcher in the sidebar, full RTL mirroring for Arabic, and hand-authored translations for English, Russian, Turkish, Arabic.

### New i18n infrastructure (`src/lib/i18n/`)
- `config.ts` — locales `['en','ru','tr','ar']`, `DEFAULT_LOCALE`, `RTL_LOCALES=['ar']`, `LOCALE_COOKIE='pp_locale'`, `LOCALE_LABELS`, `isRtl`, `localeDir`, `normalizeLocale`.
- `get-dictionary.ts` — server-only; `getLocale()` (reads cookie via `next/headers`) and `getDictionary()` → `{ locale, dir, t }`.
- `actions.ts` — `setLocale(value)` server action (sets cookie).
- `I18nProvider.tsx` — client provider + `useI18n()` hook. IMPORTANT: only the `locale` string crosses the server→client boundary; the dictionary (which contains formatter FUNCTIONS) is resolved client-side from the bundled dictionaries (functions can't be serialized through RSC props).
- `workflow-strings.ts` — `WorkflowStrings` type + English default (`enWorkflow`), consumed by `lib/participant-workflow.ts`.
- `dictionaries/index.ts` — composes `{ en, ru, tr, ar }`, exports `Dictionary = typeof en`.
- `dictionaries/{en,ru,tr,ar}/index.ts` — per-locale barrels spreading `core` + `workflow` + namespaces (`unit, team, payment, flights, tickets`).
- `dictionaries/{en,ru,tr,ar}/core.ts` — namespaces: `common, nav, dashboard, workflowPanel, statusBar, registration, journey, confirm, hostInfo`.
- `dictionaries/{en,ru,tr,ar}/{unit,team,payment,flights,tickets}.ts` — per-page namespaces.
- `dictionaries/{ru,tr,ar}/workflow.ts` — localized `WorkflowStrings`.

### Files WIRED to translations
- `src/app/(dashboard)/layout.tsx` — reads locale, sets `dir`/`lang`/`data-locale` on the portal shell, wraps children in `I18nProvider`.
- Sidebar: `components/pats/PatsPortalNav.tsx` (+ new `components/pats/LanguageSwitcher.tsx`), `components/pats/PatsPortalNavServer.tsx` (passes `wf: t.workflow` to `deriveWorkflowStages`).
- `lib/participant-workflow.ts` — `deriveWorkflowStages` now takes optional `wf?: WorkflowStrings` (defaults to English); all stage label/sub literals replaced.
- Pages: dashboard, journey, confirm-participation (card), edit/unit, host-info, tickets (list + `[id]`), loading.tsx.
- Components: `dashboard/{DashboardStatusBar, ParticipantWorkflowPanel, ParticipantRegistrationDetailsCard, JourneyWizard, ParticipationConfirmCard, UnitEditForm, PaymentInstructions, PaymentSubmissionForm}`, `team/TeamRosterManager`, `flights/FlightDetailsManager`, `tickets/{SupportTicketsPanel, NewTicketForm, TicketReplyBox, TicketStatusBadge, TicketThread}`.
- Shared ticket components (`TicketStatusBadge`, `TicketPriorityTag`, `TicketThread`) are used by ADMIN too, so they take OPTIONAL translated-label props with English fallback (admin stays English).
- CSS: added `.pp-lang*` switcher styles + `[dir="rtl"]` portal overrides in `src/app/globals.css`.

### Known minor exclusions (left English on purpose)
- Browser-tab `metadata.title` exports; generic shared toast constants in `@/lib/toast`; public site chrome (header/footer) around the portal; user-entered data (names/units).

### Leftover file to delete
- `tsconfig.i18ncheck.json` in project root — a temp type-check config I couldn't delete (permission denied). Harmless (unused, not a `.ts`). Safe to remove anytime.

---

## PART B — NEW REQUESTED TASKS (this is where work resumes)

User's verbatim intent, itemized:

1. **Landing page cleanup** — remove three sections (per screenshots):
   - Elite mission cards ("Night Combat Navigation", "Tactical Reconnaissance", "Physical Agility & Survival", … with "MISSION BRIEF →").
   - "PATS VIDEO GALLERY" section.
   - "COMPETITION UPDATES" / "NOTICES" section.
2. **Replace "No Guts No Glory"** on the landing page with the **Urdu motto from the logo**: `یقین محکم ، عمل پیہم ، محبت فاتح عالم`.
3. **Events Detail** — from the Exercise Contour section, fetch the events data; add a NEW navbar item **"Events Detail"**; build that page professionally; make it **dynamic with full admin management (CRUD)**; display all events as **cards**; allow admin to **add card thumbnails**.
4. **Global logo swap** — use the **new crest logo** (the one on the main landing site, shown in the 4th uploaded screenshot — green/black PATS emblem with Urdu) **everywhere**: header, sidebar, footer, admin — wherever a logo is used.
5. **Announcements page** — new navbar page listing all admin-added announcements as **cards**; clicking a card opens **detail (title, content, image)**.
6. **Marquee behavior** — when the user **hovers** a news item in the marquee, the marquee **pauses** there; **clicking** a news item **navigates** to that news in the Announcements page.
7. **Marquee styling** — it currently scrolls **too fast → slow it down**; add a **speaker icon** in the left corner; give it a **red color** so it stands out.
8. **International participation map** — show a real map with countries **from which teams are registered** (fetch ALL such countries from the DB); make it **sleek**; on **hovering** a country, show the **team names + the year they registered**; **remove the team-details list currently below the map**. Reference impl provided: `world.svg` + `StdpCountryContractsList.tsx` from `D:\ProjectManagementSystem` (see below).

---

## CODEBASE FINDINGS (so no re-exploration is needed)

### Landing page
- Route: `src/app/(public)/page.tsx` → renders `components/army/HomeArmy.tsx` with `settings`, `keyDates`, `newsPosts`, `featuredHtml`.
- `HomeArmy.tsx` sections in order: HeroSlider, StatsBar, mission showcase, careers (`PatsImageGrid`), **operations → `MissionPillarTrack` (THE ELITE CARDS)**, About PATS, **`PatsVideoGallery` (VIDEO GALLERY)**, **`updates` PatsSection (COMPETITION UPDATES / featured news list)**, key dates schedule.
  - Elite cards data: `FEATURED_DRILLS` from `TACTICAL_DRILLS` (`lib/pats-content.ts`), rendered by `components/operations/MissionPillarTrack.tsx` + `components/operations/DrillCard.tsx`.
  - Video gallery: `components/pats/PatsVideoGallery.tsx`, data `PATS_HOME_VIDEOS` (`lib/pats-home-content.ts`).
  - Updates section is inline in `HomeArmy.tsx` (uses `newsPosts` / `featuredHtml`).
- To remove sections: delete those JSX blocks in `HomeArmy.tsx` (and prune now-unused imports/props to keep tsc + eslint clean).

### "No Guts No Glory"
- `src/lib/branding.ts`: `NAV_BRAND_TAGLINE = "No guts, no glory"`, `HERO_MOTTO = "NO GUTS NO GLORY"`, plus a trailing "No guts, no glory." in a description string. Also `lib/pats-content.ts`: `PATS_MOTTO = "NO GUTS NO GLORY"`.
- Landing hero motto is `HERO_MOTTO` (check `components/army/HeroSlider.tsx` for where it renders). Replace with the Urdu string. Ensure the font renders Urdu (may need `dir="rtl"` + an Urdu-capable font/`lang="ur"`).

### Navigation
- Public navbar config: `src/lib/public-navigation.ts` → `PUBLIC_NAV_ITEMS` (Home, Exercise Contour, International Participation, Awards, Gallery, Key Dates). Add "Events Detail" and "Announcements" here.
- Admin navbar config: `src/lib/admin-navigation.ts` → `ADMIN_NAV_ITEMS` grouped Operations/Content/System. Existing Content items: News Management (`/admin/news`), Gallery Management (`/admin/gallery`), Announcement Management (`/admin/ticker`), Key Dates. Add Events Management (+ Announcements if new model).

### Exercise Contour "events" (currently static)
- Page: `src/app/(public)/exercise-contour/page.tsx` → `components/exercise-contour/ExerciseContourDashboard.tsx` (569 lines).
- Data: `src/lib/exercise-contour.ts` (745 lines). `CONTOUR_EVENTS: ContourEvent[]` starts at line 193.
- `ContourEvent` shape: `{ id, title, marks:number, icon:string, category:EventCategory, difficulty:Difficulty, duration:string, summary:string, details:string, breakdown?:{label,marks}[], participants?:string }`.
- These ~28 events are the source for the new dynamic Events model + Events Detail page. Add a `thumbnail`/image field. Seed the DB from this array (write a seed/migration script).

### Marquee / Ticker
- Model: `TickerAnnouncement` (prisma) — fields: `message @db.Text`, `shortLabel?`, `priority`, `status`, `visibility`, `isUrgent`, `sortOrder`, `expiresAt?`. NO title/content/image.
- Config/helpers: `src/lib/ticker.ts` — includes `TICKER_SCROLL_SPEED`, `TICKER_SCROLL_DURATION_SEC = { SLOW:65, NORMAL:41, FAST:27, VERY_FAST:16 }` (seconds per loop; higher = slower). `SiteSettings.tickerScrollSpeed` default `NORMAL`. To slow down: raise these durations (or default to SLOW).
- Marquee render: `components/public/PublicLayoutClient.tsx` passes a `siteTicker` node; the actual marquee component renders the ticker items (search for the `SiteTicker`/ticker render component — grep `siteTicker`). Styling likely in `globals.css` under `pats-site-chrome--has-ticker` / marquee classes. Add: speaker icon left, red background, `animation-play-state: paused` on hover per item, and slower duration.

### News / Announcements
- Model: `NewsPost` (prisma) — `{ slug @unique, title, content @db.Text, published, publishedAt, pdfPath?, pdfOriginalName?, pdfMimeType?, pdfFileSize? }`. Has PDF, NO image field.
- Public detail route already exists: `src/app/(public)/news/[slug]/`. Admin: `/admin/news` (News Management).
- If unifying announcements on News (recommended): add `imagePath`/`imageMimeType`/`imageFileSize` to `NewsPost`, build `/announcements` list (cards) + reuse/extend detail, point marquee items to `/announcements/<slug>` (or `/news/<slug>`), add image upload in `/admin/news`.

### International participation + map
- Page: `src/app/(public)/international/page.tsx` → sections: `WorldMapPanel` (DECORATIVE FAKE MAP), `NationsWall` (TEAM LIST BELOW MAP — remove this), `ParticipationTimeline`, orientation modules.
- Current data is STATIC: `INTERNATIONAL_EDITIONS`, `COUNTRY_NAMES`, `CountryCode` in `lib/pats-content.ts`; `lib/contingents.ts` builds contingents from editions.
- `components/international/WorldMapPanel.tsx` (87 lines) — fake map with `MAP_POSITIONS` percentages, not a real SVG. `NationsWall.tsx` (76 lines), `ContingentDrawer.tsx` (113 lines).
- REAL DATA for the new map: `User` model has `country String?`, `nationality String? @default("Pakistani")`, `unit Unit?` (unit has `unitName`), and timestamps (`createdAt`, `teamRegisteredAt`) for the "year registered". A "team" = a registered participant/unit. Group registered users by `country`; per country list `unit.unitName` (team names) + year from `teamRegisteredAt ?? createdAt`.
- Need a public API route (e.g. `/api/public/registered-countries`) returning `[{ country, teams: [{ name, year }] }]`.

### Reference implementation for the map (uploaded)
- File: `StdpCountryContractsList.tsx` (uploaded to chat; from `D:\ProjectManagementSystem\src\components\analytics\StdpCountryContractsList.tsx`).
- How it works: fetches `/world.svg` (from `public/`), strips its `<style>`, injects into a div; maps SVG path `id`/`class`/`name` → a country key via `countryIsoMap` + special-cases; for countries with data it builds flag `<pattern>`s (using `/flags/xx.png`) and fills paths, adds hover color + `react-tooltip` tooltips + click handlers; also renders a side legend list.
- Dependencies in that impl: `react-tooltip`, a `useSTDP` context, `/world.svg`, `/flags/*.png`, `@/lib/formatters`. For PATS, ADAPT: drop the STDP context/currency stuff; fetch registered-countries from PATS API; tooltip shows team names + years; remove the legend list (user wants the list gone). Needs `world.svg` + flag images copied into PATS `public/` (NOT present currently).

### Logo
- Component: `src/components/pats/PatsLogo.tsx` using `PATS_LOGO` from `lib/branding.ts`:
  `PATS_LOGO = { src: "/media/pats/pats-logo.webp", navSrc: "/media/pats/pats-logo-nav.webp", ... }`.
- Assets present: `public/media/pats/{pats-logo.webp, pats-logo-nav.webp, pats-logo-512.webp}`; also `public/images/{logo.png, logo.webp}`.
- To swap globally: replace the asset(s) that `PATS_LOGO` points to (or repoint `PATS_LOGO` to the new file). `PatsLogo` is used in nav/footer (search `PatsLogo` usages). Also check admin sidebar/header + participant sidebar for any separate logo usage.

---

## OPEN DECISIONS (need answers before building)

**Q1 — Announcements source.** What powers the new Announcements page + marquee?
- (A, recommended) **Unify on News** — reuse `NewsPost`, add an image field; marquee + Announcements page both show these; admin via News Management. Least duplication.
- (B) **Extend the ticker `Announcement`** model with title/content/image.
- (C) **Brand-new Announcements model** separate from both.

**Q2 — World map assets.** How to obtain `world.svg` + flag images?
- (A) **Connect `D:\ProjectManagementSystem`** (folder-picker) so the assets can be copied + implementation mirrored.
- (B) **Upload `world.svg` + flags** into the chat.
- (C) **Source a standard world SVG + flag set** (e.g. `flag-icons`) and adapt the matching logic.

**Q3 — Logo file.** How to get the exact new crest logo?
- (A) **Upload the logo** (PNG/SVG, transparent preferred).
- (B) **Use existing `/media/pats/pats-logo.webp`** if it's already the correct crest.

(These were asked via a picker that got dismissed by a misclick — please answer in text or re-run.)

---

## PROPOSED PHASED PLAN (execution order + notes)

**Phase 1 — Landing cleanup + Urdu motto** (no decisions needed; safe to start immediately)
- Edit `components/army/HomeArmy.tsx`: remove the operations/`MissionPillarTrack` block, the `PatsVideoGallery` block, and the `updates` news block. Prune unused imports/props (`PatsVideoGallery`, `MissionPillarTrack`, `PATS_HOME_VIDEOS`, `FEATURED_DRILLS`, news-related props if now unused) so tsc/eslint stay green.
- Replace hero motto with Urdu. Update `lib/branding.ts` `HERO_MOTTO` (and landing usage). Render with `dir="rtl"` + an Urdu-capable font; verify glyphs. Keep `NAV_BRAND_TAGLINE`/others if still shown elsewhere (decide per screenshot — user said "on the main landing page").

**Phase 2 — Global logo swap** (needs Q3)
- Place the new logo asset in `public/media/pats/` (and a nav-cropped version if needed). Repoint `PATS_LOGO` in `lib/branding.ts`. Verify all `PatsLogo` usages + admin/participant sidebars + footer + favicon/OG if desired.

**Phase 3 — Marquee upgrade** (styling now; navigation target depends on Q1)
- Slow scroll (raise `TICKER_SCROLL_DURATION_SEC` or default speed → SLOW). Add speaker icon (lucide `Volume2`) pinned left. Red background highlight (globals.css). Pause on hover of the hovered item (`:hover` → `animation-play-state: paused` on the track). Make each item a link to the Announcements detail (per Q1) and stop the marquee where hovered.

**Phase 4 — Events Detail** (dynamic + admin)
- Prisma: add `Event` model (fields from `ContourEvent` + `thumbnailPath/thumbnailMimeType/thumbnailFileSize`, `sortOrder`, `published`, timestamps). `prisma db push` or migration.
- Seed from `CONTOUR_EVENTS` (script under `scripts/` or `prisma/seed`).
- Admin: new nav item + `/admin/events` CRUD (list, create, edit, delete, thumbnail upload — mirror `/admin/gallery` or `/admin/news` patterns + existing upload/storage helpers in `lib/storage`).
- Public: new `PUBLIC_NAV_ITEMS` entry "Events Detail" + `/app/(public)/events` (or `/events-detail`) page rendering cards (thumbnail, title, marks, category, difficulty, duration, summary; click → details). Reuse Pats section/card styling.

**Phase 5 — Announcements** (needs Q1)
- If (A): add image fields to `NewsPost`; migration; add image upload to `/admin/news`; build `/announcements` cards list + detail (title/content/image); marquee links here.
- If (B)/(C): create/extend model + admin section accordingly, then same public page.

**Phase 6 — Interactive world map** (needs Q2)
- Add `world.svg` + flags to `public/`. New API `/api/public/registered-countries` (group registered users by country → team names + years). New client `components/international/RegisteredNationsMap.tsx` adapted from the reference (drop STDP/currency; tooltip = team names + years; no legend list). Replace `WorldMapPanel` usage on the international page and DELETE the `NationsWall` list below the map. Consider `react-tooltip` (already used by reference) — check if adding a dep is acceptable, else use a custom tooltip to avoid new deps.

**Verification each phase:** background `tsc -p tsconfig.check.json`, `eslint` on changed paths, `node scripts/css-guardrails.mjs`. For DB changes, `prisma generate` + push. Optionally run the dev server for a visual pass.

---

## QUICK REFERENCE — key file paths
- Landing: `src/app/(public)/page.tsx`, `src/components/army/HomeArmy.tsx`
- Branding/motto/logo: `src/lib/branding.ts`, `src/components/pats/PatsLogo.tsx`
- Public nav: `src/lib/public-navigation.ts`
- Admin nav: `src/lib/admin-navigation.ts`
- Exercise events: `src/lib/exercise-contour.ts` (`CONTOUR_EVENTS`), `src/components/exercise-contour/ExerciseContourDashboard.tsx`
- Ticker/marquee: `src/lib/ticker.ts`, `src/components/public/PublicLayoutClient.tsx`, `src/app/globals.css`
- News: `NewsPost` (prisma), `src/app/(public)/news/[slug]/`, `/admin/news`
- International: `src/app/(public)/international/page.tsx`, `src/components/international/{WorldMapPanel,NationsWall,ContingentDrawer}.tsx`, `src/lib/pats-content.ts`, `src/lib/contingents.ts`
- Map reference (uploaded): `StdpCountryContractsList.tsx`
- Prisma schema: `prisma/schema.prisma`
- Uploads/storage helpers: `src/lib/storage/` (mirror existing gallery/news upload flow)

## Uploaded assets referenced
- 4 screenshots: (1) Elite mission cards to remove, (2) PATS Video Gallery to remove, (3) Competition Updates to remove, (4) new crest logo w/ Urdu motto `یقین محکم ، عمل پیہم ، محبت فاتح عالم`.
- 1 file: `StdpCountryContractsList.tsx` (world-map reference implementation).

---

_Handoff generated at the point where the 3 decision questions were pending. Answer Q1–Q3 to unblock Phases 2, 5, 6; Phases 1, 3 (styling), and 4 can begin immediately._
