# PATS — QA workflow guide

Enterprise registration, approval, and payment verification flows for the PATS portal.

## Test credentials

Set in `.env` for production-like admin, or use seed defaults:

| Role | Email | Password | State |
|------|-------|----------|--------|
| **Admin** | `admin@example.com` (or `ADMIN_EMAIL`) | `Admin123!` (or `ADMIN_PASSWORD_PLAIN`) | Full admin access |
| Pending participant | `pending@example.com` | `TestPass123!` | Application **PENDING** |
| Approved, unpaid | `approved@example.com` | `TestPass123!` | Application **APPROVED**, payment **PENDING** |
| Payment submitted | `payment@example.com` | `TestPass123!` | Payment **SUBMITTED** |
| Fully verified | `verified@example.com` | `TestPass123!` | Payment **APPROVED** |
| Rejected | `rejected@example.com` | `TestPass123!` | Application **REJECTED** |

### Seed database

```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```

Re-seeding removes legacy `@cambrian.test` accounts and upserts the `example.com` test users above.

**User inventory:** `node scripts/list-users.mjs` writes `USER_DATABASE_REPORT.md`.  
**Password check:** `node scripts/verify-test-logins.mjs`

## Status model

### Application (`User.applicationStatus`)

- `PENDING` — Awaiting HQ review
- `APPROVED` — May submit payment
- `REJECTED` — Cannot proceed; reason on dashboard

### Payment (`User.paymentStatus` + `Payment` records)

- `PENDING` — No submission yet
- `SUBMITTED` — Proof uploaded, awaiting admin
- `UNDER_REVIEW` — Admin reviewing
- `VERIFIED` — Admin confirmed payment received
- `REJECTED` — Resubmit required

Legacy `User.approved` is kept in sync when admins approve/reject.

## Participant flows

### 1. Registration (`/event/register`)

- Validates military email, password match, unit fields
- Duplicate email blocked
- Password bcrypt-hashed
- Creates user + unit with `PENDING` / `PENDING`
- Audit log: `user.registered`

### 2. Login (`/event/login`)

- Session JWT (8h)
- Suspended accounts blocked
- **Pending** users may log in to track status

### 3. Dashboard (`/event/dashboard`)

- Registration status card (application + payment badges)
- Checklist: unit, payment, privacy
- Latest published news

### 4. Payment (`/event/payment`)

- Available after application **APPROVED**
- Multipart upload: amount, date, reference, proof (PNG, JPG, JPEG, PDF — max 5MB)
- Proofs stored in **private internal storage** (`storage/payment-proofs/`, not under `public/`)
- Metadata on `Payment`: `internalFilePath`, uploader, mime, size, timestamps
- Access only via authenticated APIs: `/api/admin/payment-proof/[id]` (admin), `/api/user/payment-proof/[id]` (owner only)

### 5. Password reset

- `/event/forgot-password` → email with token
- `/event/reset-password/[token]` → new password

## Admin flows

Login as admin → `/admin`

| Area | Path | Actions |
|------|------|---------|
| Applications | `/admin/users` | Filter, search, open detail |
| Application detail | `/admin/users/[id]` | Approve, reject, notes, suspend, reset password, view payments & audit log |
| Payments | `/admin/payments` | Filter by status, search |
| Payment review | `/admin/payments/[id]` | Verify, change status, notes, view proof |
| Units | `/admin/units` | Edit unit data |
| News | `/admin/news` | CRUD, publish/unpublish |
| Settings | `/admin/settings` | Registration toggles, notices, social links, QR links, default payment amount |

All admin mutations write **AuditLog** entries.

## API reference (key routes)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/register` | Public registration |
| GET/POST | `/api/user/payment` | Participant payment list + submit |
| GET | `/api/user/payment-proof/[id]` | Stream own payment proof (private) |
| GET | `/api/admin/payment-proof/[id]` | Stream any payment proof (admin) |
| GET/PUT | `/api/admin/users/[id]` | User detail + review |
| GET | `/api/admin/payments` | Payment list |
| GET/PUT | `/api/admin/payments/[id]` | Payment review |
| PUT | `/api/admin/settings` | Site settings |

## Manual QA checklist

- [ ] Register new user (unique email)
- [ ] Duplicate registration returns error
- [ ] Login as pending user → dashboard shows pending
- [ ] Admin approves application → participant sees payment link
- [ ] Submit payment with proof → status SUBMITTED
- [ ] Admin verifies payment → participant PAYMENT APPROVED
- [ ] Admin rejects application with reason
- [ ] Admin suspends user → login blocked
- [ ] Admin reset password works
- [ ] News publish/unpublish affects public site
- [ ] No console errors on homepage, register, dashboard, admin

## Known limitations / remaining issues

1. **Email delivery** — Password reset requires SMTP env vars (`SMTP_*` in `.env`). Without them, reset tokens are created but mail may not send.
2. **Payment proofs** — Stored on local filesystem; production should use object storage (S3/Azure Blob).
3. **Merchandise/photography QR images** — `public/images/merchandise-qr.webp` and `photography-qr.webp` may be missing; URLs configurable in admin settings.
4. **Unit approval** — Units are tied to user application status; no separate unit approval workflow.
5. **Email notifications** — No automated emails on approve/reject/payment verify (audit log only).

## Environment variables

```env
DATABASE_URL="mysql://root:PASSWORD@localhost:3306/pats_db"
AUTH_SECRET=...
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_PLAIN=Admin123!
SMTP_FROM=noreply@example.com
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```
