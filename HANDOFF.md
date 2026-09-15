# PATS Portal — Project Handoff

> **Last updated:** 2026-06-30
> **Status:** Active development. Core flows (registration → approval → payment →
> confirmation), admin back-office, support tickets, and timeline/deadlines are
> built and working. Most recent work (team members + participant dashboard /
> tickets UX overhaul) is in the working tree — see [Development sessions](#9-development-sessions-recent-work).

This document is the single entry point for anyone (human or agent) picking up
the project. It explains what the app is, how it's built, the domain workflow,
the conventions/gotchas that aren't obvious from the code, local setup, and a
log of the most recent development sessions.

---

## Table of contents
1. [What this is](#1-what-this-is)
2. [Tech stack](#2-tech-stack)
3. [Repository layout](#3-repository-layout)
4. [Route map](#4-route-map)
5. [Data model](#5-data-model)
6. [Domain workflow, roles & statuses](#6-domain-workflow-roles--statuses)
7. [Theming & fonts (important)](#7-theming--fonts-important)
8. [Conventions & gotchas](#8-conventions--gotchas)
9. [Development sessions (recent work)](#9-development-sessions-recent-work)
10. [Agent memory](#10-agent-memory)
11. [Local setup & test accounts](#11-local-setup--test-accounts)
12. [Known follow-ups / TODO](#12-known-follow-ups--todo)

---

## 1. What this is

**PATS Portal** (`pats-portal`) is a registration and event-management web app for
the **PATS** military patrol exercise/competition. It serves three audiences from
one Next.js app:

- **Public visitors** — marketing site (home, operations, international, awards,
  gallery, documents, key dates, news, privacy) plus the auth surface
  (register / login / forgot + reset password / verify email).
- **Participants** — a logged-in portal ("Participant Panel") to manage their
  unit registration, **team members**, **payment** submission, **timeline /
  deadlines**, and **support tickets**.
- **Staff (admin back-office)** — review/approve registrations, verify payments,
  manage news, ticker announcements, key dates, units, users/roles, and support
  tickets.

The participant journey is the heart of the product: register → verify email →
get approved by staff → pay → get payment verified → **confirmed for the event**.

---

## 2. Tech stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 15** (App Router, RSC) — `next@15.5.18` |
| Language | **TypeScript 5**, **React 18** |
| ORM / DB | **Prisma 6** → **MySQL** (local dev via XAMPP/phpMyAdmin) |
| Auth | **NextAuth v5 (beta)** — credentials, with CSRF tokens, lockout, email verification |
| Styling | **Tailwind CSS 3** + a large set of hand-written CSS modules under `src/app/*.css`; **Radix UI** primitives; `class-variance-authority`, `tailwind-merge`, `clsx` |
| Forms / validation | **react-hook-form** + **zod** (`@hookform/resolvers`) |
| Email | **nodemailer** (SMTP; logs to console in dev if SMTP env not set) |
| Images | **sharp** |
| Toasts | **sonner** |
| Animation | **framer-motion**, **gsap** (marketing/cinematic pages) |
| Charts | **recharts** (admin analytics) |
| Sanitization | **sanitize-html** (news content, fee notices) |

Fonts are loaded via `next/font` in `src/app/layout.tsx`. **The app font is
Inter** (see [§7](#7-theming--fonts-important)).

---

## 3. Repository layout

```
d:\PATS
├── prisma/
│   ├── schema.prisma            # data model (MySQL)
│   ├── migrations/              # 16 ordered migrations (see §5)
│   └── seed.ts                  # test data + accounts
├── src/
│   ├── app/
│   │   ├── (public)/            # marketing + auth pages
│   │   ├── (dashboard)/         # participant portal (/event/*)
│   │   ├── (admin)/             # staff back-office (/admin/*)
│   │   ├── api/                 # route handlers (REST-ish)
│   │   ├── layout.tsx           # root layout: fonts, theme bootstrap, providers
│   │   ├── globals.css          # imports every other *.css module
│   │   └── *.css                # MANY scoped stylesheets (themes, portal, etc.)
│   ├── components/
│   │   ├── public/  army/  cinematic/   # marketing chrome (nav, footer, ticker)
│   │   ├── pats/                # portal header/nav/logo
│   │   ├── dashboard/           # participant dashboard cards
│   │   ├── team/                # team members module
│   │   ├── tickets/             # support ticket UI
│   │   ├── timeline/            # deadlines/key dates
│   │   ├── admin/               # admin widgets, status badges
│   │   └── ui/                  # shadcn-style Radix wrappers (button, dialog, …)
│   ├── lib/                     # prisma client, auth, validations (zod), constants,
│   │                           # countries, branding, mail, audit, rate-limit, etc.
│   └── middleware.ts            # route protection
├── scripts/                     # setup-uploads, prisma-generate-safe, media tools
├── storage/                     # news PDFs, payment proofs (NOT in public/)
├── uploads/                     # served via /uploads/[...path] route
├── docs/NEW-FEATURES-TESTING.md # manual test guide for tickets/roles/timeline
├── README.md                    # short setup
└── HANDOFF.md                   # ← this file
```

> ⚠️ The earlier giant `*.md` listing you may see from tooling is mostly
> `node_modules`. The only **project** docs are `README.md`,
> `docs/NEW-FEATURES-TESTING.md`, and this file.

---

## 4. Route map

**Public** (`src/app/(public)`): `/`, `/operations`, `/operations/[id]`,
`/international`, `/awards`, `/gallery`, `/documents`, `/key-dates`, `/news/[slug]`,
`/privacy`, and auth: `/event/register`, `/event/login`, `/event/forgot-password`,
`/event/reset-password[/token]`, `/event/verify-email`.

**Participant portal** (`src/app/(dashboard)`, all under `/event/*`):
`dashboard`, `edit/unit`, `edit/privacy`, `team`, `payment`, `tickets`,
`tickets/[id]`, `timeline`.

**Admin** (`src/app/(admin)`, under `/admin/*`): dashboard, `user-management`,
`users`, `units`, `payments`, `tickets`, `news`, `ticker`, `key-dates`, `settings`.

**API** (`src/app/api`): `auth/[...nextauth]`, `auth/csrf-token`, `register`,
`password-reset/*`, `settings-public`, `ticker`, `units-list`, `uploads/[...path]`,
`user/{unit,privacy,payment,payment-proof,team-members}`, `tickets/*`, and a full
`admin/*` surface (users, units, payments, tickets, news, ticker, key-dates,
settings, analytics).

---

## 5. Data model

Prisma models in `prisma/schema.prisma`:

| Model | Purpose |
|-------|---------|
| **User** | account + participant profile; carries `role`, `applicationStatus`, `paymentStatus`, `approved`, `suspended`, auth/lockout fields, privacy acceptance |
| **Unit** | 1:1 with User — unit/CO details captured at registration |
| **TeamMember** | N:1 with User — `fullName`, `serviceNumber`, `serviceArm`, `gender` |
| **Payment** | proof upload + verification lifecycle; decimal amount, status, verifier |
| **PaymentRejectionHistory** | audit trail of payment rejections |
| **SupportTicket** / **TicketMessage** | participant ⇄ staff messaging |
| **AuditLog** | actor-stamped activity history |
| **NewsPost** | published news (+ optional PDF stored in `storage/`) |
| **KeyDate** | informational dates |
| **TickerAnnouncement** | site-wide scrolling announcements (priority/visibility/scroll speed) |
| **DataEntryPeriod** | "data entry" windows shown on dashboard |
| **PasswordReset** / **EmailVerification** | opaque hashed tokens with expiry |
| **SiteSettings** | singleton: registration/payment toggles + deadlines, fee notice, payment instructions, social links, exercise dates |

**Migration timeline** (`prisma/migrations/`, chronological — a good history of how
the product grew):
`init` → `workflow_status_payments` → `payment_instructions_settings` →
`remove_patrol_phase_modules` → `payment_status_verified` →
`payment_proof_object_storage` → `internal_payment_proof_storage` →
`news_post_pdf` → `ticker_announcements` → `ticker_scroll_speed` →
`auth_hardening` → `payment_rejection_reason` → `payment_rejection_history` →
`support_tickets` (2026-06-29) → `deadlines_timeline` (2026-06-29) →
`team_members` (2026-06-30, most recent).

---

## 6. Domain workflow, roles & statuses

**Roles** (`User.role`): `user` (participant) · `sdbs` (SD Dte — Staff Duties
Directorate) · `mtd` (MT Dte — Military Training Directorate) · `admin` (full) ·
`host` (Host Formation, read-only `/host`).

**There is exactly ONE approver: the SD Dte.** It is the only role that may decide
a registration (approve / return / reject), and it does so at the END, once the
participant has completed every step. Admin and MT Dte see the same queue but are
**read-only** on that decision; admin owns everything else (settings, roles,
accounts, suspension, notes, passwords). Enforced by
`canApproveRegistration(role) === "sdbs"` in `src/lib/auth-routes.ts`, by
`requireRegistrationApprover()` in `api-helpers.ts`, and per-field in
`PUT /api/admin/users/[id]`.

**Application status** (`APPLICATION_STATUS`): `PENDING` → `APPROVED` / `REJECTED`
(returned for correction).

**Payment was removed** from the product — there is no payment step, no payment
status and no payment table.

**Participant workflow stages** (`WORKFLOW_STAGES` /
`deriveWorkflowStages` in `src/lib/participant-workflow.ts`) drive the dashboard:

1. `confirmation` — Confirm Participation
2. `unitInfo` — Unit Information
3. `roster` — Team Members
4. `flights` — Flight Details
5. `verification` — **SD Dte decides** (the only approval in the flow)
6. `hostInfo` — Host Information (post-approval, read-only)

End-to-end flow: **admin creates the account** (there is no public sign-up) →
participant works through steps 1–4 → submitting the whole roster's flight details
sets `submittedForApprovalAt`, which puts the registration in the **SD Dte
verification queue** automatically → **SD Dte approves** (or returns it for
correction) → host information is published. Deadlines are enforced **server-side**
at the API even though the public banner reads cached settings.

---

## 7. Theming & fonts (important)

- **Day/Night site theme.** A cookie (`SITE_THEME_COOKIE`) + `data-site-theme` on
  `<html>` (`day`/`night`) toggles `html.light-theme` / `html[data-site-theme="day"]`.
  Root layout inlines a bootstrap script to avoid a flash.
- **App font = Inter.** Set in `src/app/layout.tsx` (`<body>` uses `inter.className`),
  `globals.css` (`body { font-family: var(--font-inter) … }`), and `tailwind.config.ts`
  (`sans`/`body` lead with `var(--font-inter)`). Display fonts (Oswald/Barlow/Bebas)
  remain for marketing headings only.
- **The participant portal CSS is intricate.** `src/app/participant-portal-day.css`
  contains aggressive **text-colour catch-alls** that repaint `:is(p,li,span,label,…)`
  in day mode, plus a night rule in `globals.css`
  (`.cinematic-site:not(.dashboard-day) :is(span,p,li,label){color:#fff}`).
  **Practical rule when adding portal UI:**
  - Use `<div>` (not `<p>`/`<span>`) for custom text you want to colour yourself —
    divs/headings dodge the catch-alls.
  - Or reuse `portal-card` / `pats-panel` and let the theme colour the text.
  - Self-contained modules (`team-members.css`, `event-support.css`, the
    `dashboard-status` block) key their colours on the global theme attribute with
    a **night base + day override** pattern. Follow that pattern.

---

## 8. Conventions & gotchas

- **DB migrations are NOT auto-run.** Do **not** run `prisma migrate dev` /
  `prisma db push`. Edit `schema.prisma`, run `npx prisma generate` (safe — touches
  only `node_modules`, needed for typechecking), hand-write the SQL under
  `prisma/migrations/<timestamp>_<name>/migration.sql` in the existing style, then
  let the user apply it (`npx prisma migrate deploy`). Stop the dev server before
  `prisma generate` on Windows (the running node process locks the query engine).
  See [§10 Agent memory](#10-agent-memory).
- **Participant portal pages** (`/event/dashboard|payment|edit/*|team|tickets|timeline`)
  must be listed in `src/lib/participant-portal-paths.ts` so the public marketing
  **nav + news marquee are hidden** on them (they render their own sidebar). Adding a
  new portal route? Add its prefix there.
- **Validation** is centralized in `src/lib/validations.ts` (zod). The same schema is
  reused on client and server (e.g. `RegisterSchema`, `TeamMemberSchema`).
- **Status badges / labels** come from `src/lib/constants.ts` and `src/lib/user-status.ts`.
- **Uploads** (payment proofs, news PDFs) live in `storage/`, never `public/`; they're
  served through the `/uploads/[...path]` route. `npm install` auto-creates the dirs.
- **Verify locally** with `npx tsc --noEmit` (fast, used throughout) and
  `npx next lint`. A full `next build` also runs prisma-generate-safe.
- **Scratchpad** for throwaway files:
  `C:\Users\fatim\AppData\Local\Temp\claude\d--PATS\…\scratchpad` (not `/tmp`).
- **Git hygiene:** recent commit messages are placeholders (`vcbv`, `gfcnb`, …) and a
  lot of recent feature work is **uncommitted in the working tree**. See follow-ups.

---

## 9. Development sessions (recent work)

These are the most recent agent-assisted sessions on the participant experience.
Much of this is in the working tree (the `team_members` migration + UI). Each bullet
lists the intent and the primary files.

### Session A — Participant Panel refinements (team members, font, nav)
- **Post-registration → Login redirect** confirmed in `RegisterForm.tsx`
  (`router.push("/event/login?registered=true")`).
- **Team Members module**: table widened + re-spaced, action buttons replaced with
  **icon-only View/Delete** (delete is neutral, turns red only on hover).
  Files: `src/components/team/TeamMembersSection.tsx`, `src/app/team-members.css`.
  Team-member sync verified: registration persists members (`/api/register`), panel
  does optimistic add/delete (`src/components/team/TeamMembersPanel.tsx`).
- **Hide public nav/marquee on `/event/team`**: added the prefix to
  `src/lib/participant-portal-paths.ts` (it was leaking the marketing chrome).
- **App font → Inter**: `src/app/layout.tsx`, `globals.css`, `tailwind.config.ts`.

### Session B — Dashboard layout pass
- Rebalanced the dashboard into a **two-column grid with a sticky right rail**,
  compacted the welcome strip, and removed the bulky inline **PaymentInstructions**
  block. Files: `src/app/(dashboard)/event/dashboard/page.tsx`,
  `src/app/participant-dashboard.css`.

### Session C — Dashboard "sleek" pass + Tickets + Team page
- **Dashboard top status bar**: new `src/components/dashboard/DashboardStatusBar.tsx`
  surfaces application status **and a primary "Go to payment submission" button at the
  top**; removed the verbose payment-verification stack from the bottom (and the
  `latestPayment` query). The welcome strip now carries a **clickable team-member count
  chip** → `/event/team`. CSS in `participant-dashboard.css` (`.dashboard-status*`,
  `.participant-dash-welcome__team`).
- **Support tickets** (`/event/tickets`): replaced oversized cards with **compact
  rows** and made `NewTicketForm` controllable so the new
  `src/components/tickets/SupportTicketsPanel.tsx` can **hide the ticket list while the
  form is open** and show it again on close. New stylesheet
  `src/app/event-support.css` (imported in `globals.css`).
- **Team page** (`/event/team`): added a back-to-dashboard link and cleaner spacing
  (`team-page` wrapper).

> Verification for these sessions: `npx tsc --noEmit` → 0, and `npx next lint` on the
> changed files → no warnings/errors. A full `next build` was **not** run.

---

## 10. Agent memory

Persistent agent memory lives at
`C:\Users\fatim\.claude\projects\d--PATS\memory\` (indexed by `MEMORY.md`).

Current entries:
- **`db-migration-approval`** (feedback): Do **not** auto-run DB-mutating Prisma
  commands. The user interrupted `prisma migrate dev` on 2026-06-29 and prefers to
  control when their MySQL DB is altered. Workflow: edit schema → `npx prisma generate`
  → hand-write migration SQL → let the user apply. (Mirrored in [§8](#8-conventions--gotchas).)

When you learn a durable, non-obvious fact (a user preference, a project constraint,
a gotcha), add a memory file and a one-line pointer in `MEMORY.md`.

---

## 11. Local setup & test accounts

**Requirements:** Node 20+, MySQL (XAMPP). **Setup** (`README.md`):
```bash
npm install
# place the provided .env in the project root (DATABASE_URL etc.)
# create an empty DB matching DATABASE_URL in phpMyAdmin
npx prisma db push      # user runs this themselves (see §8)
npx prisma db seed
npm run dev             # http://localhost:3000
```

**Seeded accounts** (`npm run db:seed`; passwords `TestPass123!` unless noted) —
see `docs/NEW-FEATURES-TESTING.md` for the full matrix and manual test flows:

| Account | Email | Notes |
|---------|-------|-------|
| Admin | `admin@example.com` | `ADMIN_PASSWORD_PLAIN` (or `Admin123!`) |
| MT Dte (Military Training Directorate) | `mtd@example.com` | staff home `/admin` |
| SD Dte (Staff Duties Directorate) | `sdbs@example.com` | read-only |
| Participant (pending) | `pending@example.com` | awaiting approval |
| Participant (approved) | `approved@example.com` | payment due; owns 2 sample tickets |
| Participant (payment) | `payment@example.com` | payment submitted |
| Participant (verified) | `verified@example.com` | confirmed |
| Participant (rejected) | `rejected@example.com` | returned for correction |

Seed also sets registration deadline (31 Jul 2026), payment deadline (31 Aug 2026),
key dates, and sample tickets. SMTP is optional — without it, emails are logged to
the dev console.

---

## 12. Known follow-ups / TODO

- **Commit the working tree.** A lot of recent work (team members feature + dashboard /
  tickets / team UX) is uncommitted, and existing commit messages are placeholders.
  Apply the `20260630120000_team_members` migration in the DB, then commit with real
  messages.
- **Run a full `next build`** before any deploy — recent sessions verified with
  `tsc`/`lint` only.
- **`TeamMembersDashboardCard`** is now unused on the dashboard (replaced by the
  welcome chip). Remove it if it won't be reused.
- **Optional:** if confirmed participants need a payment reference/verified-date readout
  on the dashboard, re-introduce a compact version (the `latestPayment` query was
  removed from the dashboard page).
- **Theming debt:** the participant-portal day/night catch-alls (`participant-portal-day.css`)
  are heavy and specificity-sensitive. New portal UI should follow the self-contained
  night-base + day-override pattern (see [§7](#7-theming--fonts-important)).
