# PATS — New Features Testing Guide

This guide covers manual testing for the features added in this round:

1. **Support Ticket System** (#8)
2. **MTD + SDBS roles & registration approval by MTD** (#3)
3. **Timeline with enforced deadlines** (#6)

> All three are already wired into the running app. Database migrations have
> been applied (`SupportTicket`, `TicketMessage`, `SiteSettings.registrationDeadline`,
> `SiteSettings.paymentDeadline`, `KeyDate.date`).

---

## Seeded test accounts

Run `npm run db:seed` to (re)create these. Passwords:

| Account | Email | Password | Use |
|---------|-------|----------|-----|
| Admin | `admin@example.com` | value of `ADMIN_PASSWORD_PLAIN` in `.env` (falls back to `Admin123!` if unset) | Full admin |
| MTD | `mtd@example.com` | `TestPass123!` | Approver role |
| SDBS | `sdbs@example.com` | `TestPass123!` | Viewer role |
| Participant (pending) | `pending@example.com` | `TestPass123!` | Awaiting approval |
| Participant (approved) | `approved@example.com` | `TestPass123!` | Approved, payment due; **owns 2 sample tickets** |
| Participant (payment) | `payment@example.com` | `TestPass123!` | Payment submitted |
| Participant (verified) | `verified@example.com` | `TestPass123!` | Fully verified |
| Participant (rejected) | `rejected@example.com` | `TestPass123!` | Returned for correction |

The seed also sets a **registration deadline (31 Jul 2026)** and **payment deadline (31 Aug 2026)**, seeds **key dates** (some with real dates), and **2 support tickets**.

> To override the admin login, set `ADMIN_EMAIL` and/or `ADMIN_PASSWORD_PLAIN` in `.env` and re-run the seed.

## 0. Prerequisites

| Item | Notes |
|------|-------|
| Dev server | `npm run dev` → http://localhost:3000 |
| Admin account | You need an existing **admin** login to assign roles / set deadlines. |
| Test participant(s) | At least one normal participant account (register one if needed). |
| Email (optional) | Ticket/deadline notifications only send if SMTP env vars are set (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`). Without them, the email body is logged to the dev console instead — that's expected. Set `SUPPORT_NOTIFY_EMAIL` to choose the support inbox (defaults to `SMTP_USER`). |

**Tip — testing two roles at once:** use a normal browser window for the
participant and an incognito/second browser for admin/MTD, so you don't have to
log in and out repeatedly.

---

## 1. Support Ticket System

### 1a. Participant raises a ticket
1. Log in as a participant.
2. In the portal nav (left), click **Support** → you land on `/event/tickets`.
3. Click **Raise a ticket**.
4. Fill **Subject**, choose **Category** + **Priority**, write a **message**, click **Submit ticket**.
   - ✅ You are redirected to the ticket thread; your message appears.
   - ✅ Back on `/event/tickets`, the ticket is listed as **Open**.
   - ✅ (If SMTP configured) the support inbox receives a "New support ticket" email; otherwise it's logged to the dev console.

**Validation checks**
- Submit with a 1–2 character subject or empty message → ✅ inline field errors, no ticket created.

### 1b. Staff responds
1. Log in as **admin** (or MTD/SDBS — see note below).
2. Sidebar → **Support Tickets** (`/admin/tickets`).
   - ✅ The new ticket shows with participant name, category, **Open** status, message count.
3. Use the **status filter chips** (All / Open / In Progress / Resolved / Closed) and the **search box** (subject / name / email).
4. Click **Open** on the ticket.
5. Type a reply → **Send reply**.
   - ✅ Reply appears tagged **PATS team**.
   - ✅ Status automatically becomes **In Progress**.
   - ✅ (If SMTP configured) the participant receives a "new reply" email.
6. Change **Status** and **Priority** dropdowns; click **Assign to me**.
   - ✅ Changes persist after refresh; status change emails the participant.

> **Note:** the admin Support Tickets pages are currently admin-only in the nav.
> MTD/SDBS can reach a ticket by direct URL but the section is hidden from their
> sidebar by design.

### 1c. Participant reply / reopen / close
1. Back as the participant, open the ticket from `/event/tickets`.
   - ✅ The staff reply is visible.
2. Post a reply.
   - ✅ If the ticket was **Resolved**, replying reopens it to **Open**.
3. Click **Close ticket**.
   - ✅ Status becomes **Closed**; the reply box is replaced by a "ticket is closed" notice.

### 1d. Access control
- As participant, try to open someone else's ticket by guessing a URL
  (`/event/tickets/<other-id>`) → ✅ **not found** (ownership enforced).
- Logged out, hit `/event/tickets` → ✅ redirected to login.

---

## 2. MTD + SDBS Roles

Roles: **Participant** (`user`) · **SDBS** (viewer) · **MTD** (approver) · **Administrator** (full).

### 2a. Assign a role (admin only)
1. As **admin**: Sidebar → **Participation Requests** → open a participant.
2. In **Account details** you'll see a **Role** dropdown (admins only) → choose **MTD (approver)** → **Save role**.
   - ✅ Toast "Role updated"; the Role line shows the new label.
3. Repeat for another user → set **SDBS (viewer)**.

### 2b. MTD can approve registrations
1. Log in as the **MTD** user (you'll need that account's credentials).
   - ✅ After login you land in **/admin** (staff home), not the participant dashboard.
2. Sidebar shows a **reduced menu**: Dashboard, Participation Requests, Payment Verification, Participating Teams (no News/Announcements/Key Dates/Settings/Tickets).
3. Open a pending participant → **Application review** panel is visible.
4. Click **Approve** (or **Return application** with a reason).
   - ✅ Status updates; the participant is notified (approval email) and the change is in **Activity history**.
5. Confirm MTD **cannot** manage the system:
   - ✅ No **Role** dropdown, no **Delete**, no **Reset password** on the user page.
   - ✅ Visiting `/admin/settings` by URL: the page loads but **Save** returns *Forbidden* (writes are admin-only).

### 2c. SDBS is view-only
1. Log in as the **SDBS** user.
   - ✅ Sidebar shows view sections (Dashboard, Participation Requests, Payment Verification, Participating Teams).
2. Open a participant.
   - ✅ **No** Application review panel, **no** role/delete/reset controls — read-only.
3. (API spot-check, optional) A `PUT /api/admin/users/<id>` from SDBS returns **403**.

### 2d. Participants still blocked from /admin
- As a normal participant, visit `/admin` → ✅ redirected to `/event/dashboard`.

---

## 3. Timeline & Deadlines

### 3a. Configure deadlines (admin)
1. As **admin**: Sidebar → **Site Settings** → **Registration** card.
2. Set **Registration deadline** and **Payment deadline** using the datetime pickers → **Save settings**.

### 3b. Hard block — registration
1. Set **Registration deadline** to a time **in the past** → Save.
2. Open `/event/register` (log out / incognito).
   - ✅ The form is replaced by a **"Registration closed"** banner.
3. (API spot-check, optional) `POST /api/register` → **403** "registration deadline has passed".
4. Set the deadline to the **future** (or clear it) → Save → ✅ the form returns.

> Note: `/event/register` reads cached site settings (revalidates within ~1 hour),
> so the public banner may lag a change by up to an hour. The **API enforcement is
> immediate** (reads live), so submissions are always blocked correctly.

### 3c. Hard block — payment
1. Set **Payment deadline** to the **past** → Save.
2. Log in as an **approved, unpaid** participant → open **Payment**.
   - ✅ Instead of the upload form you see a **"payment deadline has passed"** message.
3. (API spot-check, optional) `POST /api/user/payment` → **403** "payment deadline has passed".
4. Set the payment deadline to the **future** → Save → ✅ the upload form returns.

### 3d. Timeline display
1. As a participant, open **Timeline** in the nav (`/event/timeline`).
   - ✅ **Deadlines** section lists each deadline with status: green "N days left", red when ≤ 7 days, grey "Closed" when past.
   - ✅ **Key dates** section lists admin Key Dates.
2. On the **Dashboard**, when at least one deadline is set:
   - ✅ A compact **"Timeline & deadlines"** panel appears with a "View full timeline →" link.

---

## 4. UI/UX improvements (#5)

### 4a. Grouped admin sidebar
- As admin, check the left sidebar is grouped under **Operations / Content / System** headings.
- As **MTD** or **SDBS**, only the **Operations** group (their permitted items) shows — empty groups are hidden.

### 4b. Admin dashboard quick-actions
1. As admin, open **/admin**.
   - ✅ A row of three shortcut cards appears at the top: **Participation Requests** (awaiting approval), **Payment Verification** (proofs to review), **Support Tickets** (open / in progress) — each showing a **live count**.
2. Click each card.
   - ✅ Participation Requests → users list filtered to pending.
   - ✅ Payment Verification → payments filtered to submitted.
   - ✅ Support Tickets → tickets filtered to open.
3. Create a new ticket / registration / payment, return to /admin → ✅ the counts increase.

### 4c. Admin global search
- In the admin header (top-right, visible on ≥ small screens), type a participant name or email into **Search participants…** and press Enter.
  - ✅ You land on the users list filtered to that query.

### 4d. Admin breadcrumbs
- Open a participant (`/admin/users/<id>`) or a ticket (`/admin/tickets/<id>`).
  - ✅ A breadcrumb trail (Dashboard › Section › Current) appears at the top; each parent crumb is clickable.

### 4e. Participant nav icons
- As a participant, check the portal nav now shows an **icon** beside each item (Dashboard, Unit information, Payment, Timeline, Support, Privacy policy).

---

## 5. Quick regression sweep (make sure nothing broke)

- [ ] Admin can still log in and reach every sidebar section.
- [ ] Existing participant dashboard, unit edit, privacy, payment pages load.
- [ ] Approving a registration as **admin** still works (and still sends the email).
- [ ] Payment proof upload + admin verification still works (no deadline set).

---

## 6. Rollback notes (if ever needed)

The migrations are additive (new tables + nullable columns), so they're safe to
leave in place. To reverse manually in MySQL:

```sql
DROP TABLE `TicketMessage`;
DROP TABLE `SupportTicket`;
ALTER TABLE `SiteSettings` DROP COLUMN `registrationDeadline`, DROP COLUMN `paymentDeadline`;
ALTER TABLE `KeyDate` DROP COLUMN `date`;
```

Migration SQL lives in:
- `prisma/migrations/20260629120000_support_tickets/migration.sql`
- `prisma/migrations/20260629140000_deadlines_timeline/migration.sql`
