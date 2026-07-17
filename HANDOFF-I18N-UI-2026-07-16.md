# PATS Portal — Handoff: i18n + Public-Page UI Overhaul

**Date:** 2026-07-16
**Scope:** Localization of static + dynamic content (public site & participant dashboard), and redesign of `/awards`, `/gallery`, `/announcements`.
**Project root:** `D:\PakistanArmyTeamSpirit` · Branch: `main` · Stack: Next.js 15 (App Router) + Prisma + NextAuth v5 beta + Tailwind

> ⚠️ **Read "Current State" first.** At the time of writing, a background agent workflow was still editing files. Do not start editing until you have confirmed it has stopped (see below).

> This is a **new** handoff doc. It does **not** replace `HANDOFF.md` (Jun 30), `HANDOFF-UI-OVERHAUL.md` (Jul 1), or `HANDOFF-PATS-TASKS.md` (Jul 13) — those cover earlier work and were left untouched.

---

## 1. Current State (verify before you continue)

| Area | Status |
|---|---|
| i18n phase (map, hero motto, international page, dashboard) | ✅ **Done & committed** (`bfc7707`) |
| `Timeline` caller type error | ✅ **Fixed** (uncommitted) |
| `/awards` redesign | ✅ **Done, verified** (uncommitted) |
| `/gallery` redesign | ✅ **Done, verified** (uncommitted) |
| `/announcements` redesign | ✅ **Done, verified** (uncommitted) |
| Verify + repair phase (redesign) | ✅ **Complete** — 7 agents, 0 errors; 7 real bugs fixed, 1 false positive rejected |
| `/events-detail` translation | ✅ **Done** (uncommitted) |
| `/operations` + `/documents` translation | ✅ **Done** (uncommitted) |
| Verify phase (events i18n) | 🟡 **Running at time of writing** — re-check |
| Auto-translate admin content | ⏸️ **Parked by user decision** (see §6) |

**Gates as of 2026-07-17 ~08:00:** `npx tsc --noEmit` → **0 errors**. `node scripts/css-guardrails.mjs` → **exit 0**. The `!important` count *dropped* 1689 → 1687 (two genuinely dead rules removed), and the baseline was re-snapshotted with `--update-baseline` to lock the improvement in, per the script's own documented convention.

### ⚠️ The dev server is on port 3000, NOT 3001

Multiple briefs and audits in this work asserted `localhost:3001`. **Nothing listens there** (`curl` → 000). Verified: `netstat` shows PID listening on **3000**, and `curl localhost:3000/gallery` → 200. One agent caught this and noted: *"Had I trusted the audit's 'empirically confirmed' framing, I'd have reported success against a dead endpoint."* Treat any claim in this document that cites `:3001` with suspicion.

**First commands to run in a new session:**

```bash
git status                       # see what's uncommitted
npx tsc --noEmit                 # MUST be clean (it was, as of the Timeline fix)
node scripts/css-guardrails.mjs  # MUST exit 0
```

Uncommitted files at handoff time:

```
 M .claude/settings.json
 M src/app/(dashboard)/event/dashboard/page.tsx   # Timeline caller fix
 M src/app/(public)/gallery/page.tsx              # gallery redesign (in flux)
 M src/app/globals.css                            # awards + gallery CSS
 M src/components/awards/AwardsShowcase.tsx       # medals wired to PNG
 M src/components/gallery/GalleryGrid.tsx         # gallery redesign (in flux)
 M src/lib/public-layout.ts                       # /gallery → PAGE_BANNER_PATHS
?? src/lib/i18n/gallery-category-i18n.ts          # new — album category translations
```

Because the gallery agent was interrupted mid-task, **treat `/gallery` as unverified**: re-run typecheck + guardrails, then load `http://localhost:3001/gallery` and confirm the lightbox, the year/"All archives" filter chips, and the empty state all still work before trusting it.

---

## 2. Hard Constraints (these break the build or the box)

1. **CSS guardrails** — `node scripts/css-guardrails.mjs` runs on every `dev`/`build`/`lint` and **ratchets** (counts may only go down):
   - No new `.css` files under `src/` → **all styling goes in `src/app/globals.css`** (~21.6k lines)
   - `!important` count may not increase (**1689** at handoff)
   - No new `import "*.css"`
   - Raw hex literals in `.tsx` may not increase (**80** at handoff) → use `rgb()`/`rgba()` or CSS classes in `.tsx`
2. **Prisma + Windows DLL lock** — `prisma generate` fails while `next dev` is running. This is triggered by `npm install` too, because `package.json` has `postinstall: … && prisma generate`. **Stop the dev server before any install or `prisma db push`.**
3. **No external API calls from the server at runtime** — user constraint, stated 2026-07-16. See §6.
4. **Dev server** runs on `http://localhost:3001`.

---

## 3. i18n Architecture (already built — do not re-invent)

- **Locales:** `en, ru, tr, ar, zh` (`src/lib/i18n/config.ts`). `ar` is RTL. **`en` is the source of truth for the `Dictionary` TYPE** — a key present in `en/` but missing in any other locale is a **compile error**.
- **Server components:** `const { t, locale } = await getDictionary()`
- **Client components:** `useI18n()` (throws outside provider) / `useI18nOptional()` (returns `null`)
- **Dictionaries:** `src/lib/i18n/dictionaries/{en,ru,tr,ar,zh}/*.ts` — every locale mirrors the EN shape exactly (same keys, same function arities).

### The pattern for dynamic / DB-driven content

`src/lib/i18n/key-date-i18n.ts` is the canonical example: normalize the English source string into a lookup key → map to a per-locale value → **fall back to the original string** when unrecognised, so unknown admin-entered rows still render (just untranslated).

Modules built on this pattern:

| Module | Purpose |
|---|---|
| `key-date-i18n.ts` | Admin-entered Key Dates (pre-existing) |
| `international-i18n.ts` | **New** — per-locale country + contingent names for the world map |
| `api-error-i18n.ts` | **New** — localizes the ~31 English `ApiError` strings from `src/app/api/user/**` |
| `date-tags.ts` | **New** — centralized `Record<Locale, string>` date formatting tags |
| `gallery-category-i18n.ts` | **New, in flux** — album category labels |
| `workflow-strings.ts` | Pre-existing, **fully solved across all 5 locales** — do not re-solve stage labels |

---

## 4. What Was Fixed (with the traps that were found)

### 4.1 The headline bug — `/international` bottom section ✅
`src/app/(public)/international/page.tsx` rendered `ORIENTATION_MODULES` and `HISTORY.narrative` **imported directly from `src/lib/pats-content.ts`** — hardcoded English constants that never touched the dictionary. That's why the section headings translated but the module tiles and the "Since 2005…" narrative stayed English.
**Fix:** moved into `t.publicSite.pages.international.orientationModules` / `.historyNarrative`, translated in all 5 locales. `pats-content.ts` retained as the EN source for other importers.

### 4.2 Hero motto & title ✅
- **Motto** (`یقین محکم ، عمل پیہم ، محبت فاتح عالم`): **user decision** — keep the original Urdu script on **EN** (it's the crest's heraldic form, `lang="ur" dir="rtl"`, `.pats-urdu-motto` nastaliq font); render a real translation for ru/tr/ar/zh with correct `lang`/`dir` and **without** the nastaliq class (it can't render Cyrillic/Latin/CJK). Implemented via an `isUrduCrest` check in `PatsHero.tsx`.
  ⚠️ An audit agent argued the motto "should stay Urdu in every locale." **That was overridden by explicit user instruction.** Don't revert it.
- **Title** `t.home.hero.titleLine1/titleLine2`: now genuinely translated in all 5 (e.g. zh `巴基斯坦陆军团队精神 (PATS)` / `竞赛`), with the Latin `(PATS)` acronym retained.

### 4.3 `/awards` ✅
- **The trap:** the `photo` flag in `AwardsShowcase.tsx` was **dead code** — declared, set, never read by the JSX — so `.pats-awards-hero-card--photo` never matched. What actually rendered put each medal in a ~104px **white circular thumb** with `object-fit: cover`, which would have **painted a white disc behind the new transparent PNGs**, defeating the cut-out entirely. Fixed; dead `photo`/`highQuality`/`unoptimized` removed.
- **Medals:** `public/awards/pats-medal-{gold,silver,bronze}.png` are genuine transparent cut-outs, generated by `scripts/remove-medal-background.js` (border-seeded flood fill via `sharp`, feathered alpha). Verified by pixel decode: alpha=0 across the full border, 38–41% transparent, ~1.2% soft feather. **Note:** the gold PNG *looks* like it has a grey backdrop in an image viewer — that's transparency compositing, not a baked background.
- **Standings width:** the whole bug was `max-width: 960px` + auto margins on `.pats-awards-showcase__standings`, while `.pats-awards-team-card` had no cap. `pats-awards-*` classes are `/awards`-only (blast radius confirmed).
- **Pre-existing bug found:** `.pats-awards-hero-card__visual > span` zeroes `border-radius` with `!important`, so the tier badge renders square instead of circular.

### 4.4 Dashboard i18n ✅
Portal was already substantially localized. The gaps were in **shared leaf infrastructure**: `src/lib/toast.ts` (plain English const, hit ~20×), `apiError()` (31 verbatim English strings), `PaymentStatusBadge`/`ApplicationStatusBadge` (no `label` prop escape hatch — the tickets badges already solved this, copy that shape), `PaymentStatusTimeline`, `Timeline.tsx`, `UnitUpdateSchema` (no zod messages), `utils.ts` date formatters (hardcoded `en-GB`). ~135 user-visible strings across 18 files, ~95 blocking.

**Known dead code (excluded from scope):** `TeamMemberFormDialog`, `TeamMemberViewDialog` (imported nowhere); `PaymentProofViewer`, `PaymentRejectionReasonBox` (admin-only).

---

## 4b. Bugs Found & Fixed by the Adversarial Verify Pass (2026-07-17)

Two of three verifiers **failed** the implementers' work. These were real:

1. **The language switcher was silently dead on four authenticated pages.** `(dashboard)/layout.tsx` nested `<I18nProvider>` *inside* `<PublicLayout>`, so `PublicLayout`'s nav/footer fell **outside** the provider — `useI18nOptional()` returned `null`, and both navs render the switcher as `{i18n ? <PublicLanguageSwitcher /> : null}`, so it rendered **nothing**, and nav labels fell back to English. Affects the four `(dashboard)` routes not listed in `participant-portal-paths.ts`: `/event/journey`, `/event/flights`, `/event/host-info`, `/event/confirm-participation`. **Fixed** (provider now wraps `PublicLayout`, mirroring `(public)/layout.tsx`) and **verified at runtime** with a real participant session (`verified@example.com` / `TestPass123!`): all four routes return 200 and render `aria-label="Открыть меню"` under `pp_locale=ru`, byte-identical to `/gallery`.
2. **The gallery caption ask was broken in the day theme.** Wrapping `GalleryGrid` in `<PatsSection variant="navy">` newly placed tiles under a `.pats-section--navy` ancestor, activating day-theme rules that overrode the white caption text. Fixed by scoping with `:not(.pats-gallery-tile)`, following the existing `.pats-video-gallery` precedent — no new `!important`.
3. **The lightbox declared `role="dialog" aria-modal` with zero focus management.** Fixed: focus moves to close on open, Tab cycles within, focus restores to trigger on close, body scroll locks. Keyed on a derived `isOpen` boolean — **not** `activeIndex`, which would re-steal focus on every arrow press.
4. **`PaymentProofFileRow.tsx` had no i18n import at all**, orphaning the entire `payment.proof` dictionary section on a localized participant surface. Wired up.
5. **`/international`'s `historyEyebrow`/`historyTitle` keys were translated but never rendered.** Given their own section; verified live (`ru` → 3× "Хронология изданий").
6. **Gallery meta strip reused labels whose meaning didn't fit** (`Field archive → 1 Photo`). Purpose-built `metaPhotosLabel`/`metaYearsLabel` added in all 5 locales.
7. **Awards CSS was split across two blocks ~6,300 lines apart**, the earlier one almost entirely dead. Spliced out (159 lines).

**One reported problem was a false positive** — the reviewer read the *committed* version of `PaymentStatusTimeline.tsx`, which was already fixed in the working tree. The repair agent verified and changed nothing rather than "fixing" it into a regression.

Two traps the agents caught that the audits got wrong:
- Simply *removing* `max-width` from the awards grid would have let a **stale `960px` from a superseded block win**, making it narrower. `max-width: none` was set explicitly.
- The review's plan to fold reveal rules while leaving reduced-motion rules in place would have **broken `prefers-reduced-motion` entirely** (media queries add no specificity, so a later `opacity: 0` beats an earlier `opacity: 1` → cards permanently invisible).

Also pre-existing and now fixed: the gallery tile was a `motion.button`, and framer-motion writes an **inline** `transform`, which outranks CSS classes — so `hover:-translate-y-1` was almost certainly **never working**.

---

## 5. Remaining Work

### 5.1 `/gallery` — finish + verify 🟡
The audit **corrected two false premises**, both important:
- **The grid renders ALBUM tiles (one per category), NOT per-image tiles.** `item.caption` renders **only in the lightbox**. The requested dark-overlay + white-text treatment **already existed** on tiles — what was actually missing is that the scrim was a full-height `inset-0` gradient rather than a **bottom-pinned footer band**. Do not build per-image tiles; that's a rewrite nobody asked for.
- **Whitespace = a DOUBLE header offset.** `/gallery` was excluded from `PAGE_BANNER_PATHS` (`src/lib/public-layout.ts`), so the body got `padding-top: var(--site-header-height)` **and** `.pats-gallery-page` applied `calc(var(--site-header-height) + …)` again. **Swapping in `PatsPageHero` alone does NOT fix this** — it only relocates the gap. The fix **requires** adding `/gallery` to `PAGE_BANNER_PATHS` (done). Verify the offset applies **exactly once** — the opposite failure is content hidden *under* the fixed navbar.

**Must not regress:** the lightbox (open/close/next/previous/keyboard/focus), the year + "All archives" filter chips, the DB-vs-static fallback in `getGalleryItems()`, the empty state.
**Note:** the DB currently has **one published gallery image** → one album tile. That's data, not a bug.

### 5.2 `/announcements` — not started ❌
Audit findings (empirically confirmed against the running dev server by diffing rendered DOM):
- **Whitespace:** the wrapper chain is **byte-identical** to `/key-dates`. The only structural delta is `pats-page-hero__meta`. So "use the same header style as Key Dates" = **one edit: stop passing the `meta` prop** (~77–85px reclaimed).
- A second, shared source of white: `.pats-inner-page-shell` grid `gap` paints a near-white `#f4f7fa` stripe in **night theme only** (day theme kills it with `gap:0 !important`). This affects **every inner page** — higher risk, do not change globally as part of this task.
- **Master-detail: KEEP the `/announcements/[slug]` route and restyle it.** Decisive reasons: the global `AnnouncementTicker` links to `/announcements/${slug}` from **every public page** (`load-public-chrome.tsx:28`); `[slug]` already has real `generateMetadata` with per-post OG images; content is HTML **sanitized server-side with `sanitize-html`**, which a client panel cannot reuse without shipping all ~60 post bodies or adding an API route. Destroying those permalinks would be a regression.
- **Pre-existing bugs to fix:** hardcoded `en-GB` dates (use the new `date-tags.ts`), untranslated strings on the detail page, HTML entities leaking into excerpts, a dead ~70-line CSS block, and `[slug]` never being revalidated (the list has `revalidate=3600`).

### 5.3 `/events-detail` — newly discovered, not started ❌
**This is in the live navbar (`PUBLIC_NAV_ITEMS`) and is 100% English** — a bigger untranslated surface than anything originally flagged. Hardcoded chrome ("Participants", "Marks breakdown", "Total marks for this event", "All", "Search events…", "Marks", the hero block) **plus fully DB-driven event text**.
`/operations` and `/documents` are also near-100% hardcoded English but are **unlinked from the live navbar** (only the dead `CinematicNav` lists them) → reachable by direct URL only → medium priority.

### 5.4 Dead code discovered (do NOT spend time translating)
`WorldMapPanel`, `NationsWall`, `ContingentDrawer`, `ParticipationTimeline` have **zero importers** and are mounted on no live route. They are the only consumers of `pats-content`'s `COUNTRY_NAMES` and `INTERNATIONAL_EDITIONS` (via the equally dead `contingents.ts`). Also dead: `TEAM_ROLES`, `AWARD_TIERS`, `PATS_PILLARS`, `MISSION_QUOTE`/`MISSION_BODY`, `ABOUT_PATS`, `PARTICIPATION_INFO`, `INTERNATIONAL_TEAMS`, `REGISTRATION_INFO`, `FOOTER_LINKS`. The awards page already reads roles/tiers from the dictionary.

---

## 6. Admin-entered content translation — UNPARKED, in progress (2026-07-17)

**Resolution:** auto-translation is dead (see below); the surviving design is **manual per-locale fields in the admin forms**, and it is being built.

**Schema is already pushed and the client regenerated** (`prisma db push` + `prisma generate` ran cleanly with the dev server stopped, then the server was restarted). `prisma.translation` is live — verified `translation.count() === 0`. See the `Translation` model in `prisma/schema.prisma` (polymorphic: `model`/`recordId`/`locale`/`field`/`value`/`sourceHash`, unique on the composite key).

Design decisions baked in:
- **Fallback chain:** DB `Translation` → existing static lookup (`key-date-i18n` / `event-content-i18n`) → English source. The static lookups are **kept** — they still correctly cover fixed-vocabulary fields (`Event.category`/`difficulty`/`duration`, breakdown labels, known KeyDate labels). A DB translation wins because an admin typed it deliberately.
- **English is never stored in `Translation`** — it lives on the source model; locale `en` short-circuits without querying.
- **`sourceHash`** (SHA-256 of the English value at save time) lets the admin UI flag "English changed since this was translated."
- **No FK cascade** (polymorphic), so deleting a source record must explicitly delete its translation rows.
- **`NewsPost.content` is stored HTML** — an admin-supplied translation is untrusted input and must pass the same `sanitize-news.ts` allowlist as the English content. This is the one genuine security risk in the feature.
- **Translate display only, never filter keys** — `EventsDetailView` filters on raw `category`/`difficulty` and builds `ec-diff--${difficulty}` from the raw value; `/announcements/[slug]` is looked up by slug. Translating any of those silently breaks non-English locales.

Translatable fields: `Event` → title, summary, details, participants · `NewsPost` → title, content · `GalleryImage` → title, caption · `KeyDate` → label, value.

### Why auto-translation is dead (do not revisit without new information)

**The request:** admin-entered events (and announcements, gallery captions, key dates) should be translated automatically.

**The core problem:** admin content is written at **runtime** via `/admin/events`, so it **cannot be translated at compile time**. The existing `key-date-i18n.ts` lookup only works because someone hand-wrote the strings in advance — a brand-new event's `title`/`summary`/`details` falls straight through to English.

**Where it stopped:** the user initially chose auto-translate-on-save via the Claude API, then **parked it** with the constraint **"no external API call"**. That rules out the Claude API design at runtime — and arguably the offline-job variant too (still an external call, just from a trusted machine rather than the server).

**Additional context:** `@anthropic-ai/sdk` is **not installed**, `.env` has **no `ANTHROPIC_API_KEY`**, and the `ant` CLI is absent. `.env` **is** gitignored and untracked, so a key there would never reach the repo. Separately, the prod VM (`afiu.org.pk`) was compromised by a cryptominer in Jul 2026 and sudo-level hardening is still pending — a long-lived key on that box is a genuine liability.

**The option that survives the "no external API" constraint:** **admin types translations manually** — add per-locale (ru/tr/ar/zh) tabs to the admin forms, store per-locale fields, fall back to English when absent. Zero credentials, zero cost, no external dependency, fully accurate. Cost is admin effort: 4 translations per record.

**Design sketch if it's ever revived:** a single polymorphic table avoids touching four model schemas —
```prisma
model Translation {
  id         String   @id @default(cuid())
  model      String   // "Event" | "Announcement" | "GalleryImage" | "KeyDate"
  recordId   String
  locale     String   // "ru" | "tr" | "ar" | "zh"
  field      String
  value      String   @db.Text
  sourceHash String   // detects staleness / skips unchanged fields
  updatedAt  DateTime @updatedAt
  @@unique([model, recordId, locale, field])
  @@index([model, recordId, locale])
}
```
Note `Event` holds `title`, `summary`/`details` (`@db.Text`), `participants`, and a JSON `breakdown` of `{label, marks}`. Announcements are **stored HTML** — translating them must preserve markup and stay inside the existing `sanitize-html` path; that's the riskiest of the four, do it last.

---

## 7. Decisions Already Made (don't re-litigate)

| Decision | Choice | Why |
|---|---|---|
| Medal backgrounds | Process to **transparent PNG** via `sharp` | Robust on any page background; handles the tricky silver-on-grey case |
| Urdu motto | **Urdu on EN**, real translation on ru/tr/ar/zh | It's the crest's heraldic form; user chose this explicitly |
| Announcements master-detail | **Keep `/announcements/[slug]`**, restyle it | Ticker links to it site-wide; has OG metadata; server-side sanitization |
| Gallery captions | **Footer band on album tiles**, not per-image tiles | The grid is album-based; the user's premise was based on a misread |
| Admin content translation | **Parked** — no external API calls | User constraint, 2026-07-16 |

---

## 8. Gotchas

- **Dictionary parity is a compile error, not a warning.** Add a key to `en/` and you must add it to `ru/tr/ar/zh` with the same shape **and function arity**. A common failure is adding to all 5 but pasting the **English string** into the four non-English ones — grep for Latin-script values in the Cyrillic/Arabic/CJK dictionaries. Legit exceptions: `PATS`, `CBRN`, `AFOS/ATGP`, `LMG`, `MPC`, proper nouns.
- **Pluralization:** Russian has 3 plural forms, Arabic more, zh/tr none. A naive `n === 1 ? "" : "s"` ported into ru/ar is a bug. Use `Intl.PluralRules`.
- **`useI18n()` throws outside a provider.** Switching a component from `useI18nOptional()` to `useI18n()` can 500 a page in production. `RegisteredNationsMap`, `GalleryGrid`, the nav and the footer are the risky ones.
- **Shared components:** `StatusBadges` is shared with the admin console. Check importers before editing anything under `src/components/`.
- **`.pats-data-table` is shared** between `/awards` and `/key-dates` — a width change on one can leak to the other.
- **`formatDateLong`** is used on public pages too. Any locale-awareness change must be **additive** (optional param, unchanged default).

---

## 9. Agent-Workflow Artifacts (for reference)

Two multi-agent workflow runs produced this work. Transcripts:

```
C:\Users\fatim\.claude\projects\d--PakistanArmyTeamSpirit\01a73679-4b19-4ac2-8c1d-5d674051a6da\subagents\workflows\
  wf_43e0a150-6f9\   # run 1: 5 audits + i18n build phase (died before redesign)
  wf_42679689-437\   # run 2: awards ✅, gallery 🟡, announcements ❌
```
`journal.jsonl` in each holds the agents' structured return values; the five original audit reports live in run 1's journal and are the source of most of §4/§5 above.
