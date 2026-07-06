# PATS Registration Approval Flow — Specification & Build Notes

> **Status:** NOT yet implemented. This document is the design/spec so the multi-level
> approval hierarchy can be built later.
> **Author:** captured during verification pass on **2026-07-02**.
> **Scope:** registration + payment approval routing between JLA / MT Dte / SD Dte.

---

## 1. Purpose

Today the portal approves registrations in a **single flat step**. The organisation
requires a **multi-level approval hierarchy** with hand-offs between three back-office
roles. This document records:

1. The **target workflow** (what it must do).
2. The **current state** in code (what exists today), with file references.
3. The **gap** between them.
4. A concrete **proposed design** (schema, statuses, transitions, permissions, UI, emails).
5. Open **decisions** (with recommended defaults).
6. An ordered **implementation checklist** and **file map**.

---

## 2. Roles (naming ↔ code)

The three staff roles already exist in the codebase. They map to the org roles as follows:

| Org role (business name) | Code role slug | Current label ([auth-routes.ts](src/lib/auth-routes.ts)) | Current power |
|---|---|---|---|
| **JLA Admin** (Junior Leaders Academy) | `admin` | "Administrator" | Full admin; only role that verifies payments & manages everything |
| **MT Dte Admin** (Level 1 approver) | `mtd` | "MTD (approver)" | Can approve/return registrations |
| **SD Dte Admin** (final approver) | `sdbs` | "SDBS (viewer)" | **Read-only today — cannot approve** |
| Participant | `user` | "Participant" | Registers, pays, views own dashboard |

Defined in [src/lib/auth-routes.ts](src/lib/auth-routes.ts):
`ROLES`, `STAFF_ROLES = [admin, mtd, sdbs]`, `ASSIGNABLE_ROLES`, `ROLE_LABELS`,
`isAdminRole`, `isStaffRole`, `canAccessAdminArea`, `canApproveRegistration (admin||mtd)`,
`canManageSystem (admin)`, `getRoleHomePath`.

---

## 3. Target workflow (required)

```
[User] registers a team  ─────────────►  [User] submits payment
                                                │
                                                ▼
   ┌─────────────────────────  JLA Admin (admin)  ─────────────────────────┐
   │ 1. Verifies / confirms the payment                                     │
   │ 2. Marks the request to MT Dte for Level-1 approval                    │
   └────────────────────────────────┬───────────────────────────────────────┘
                                     ▼
                         MT Dte Admin (mtd)  — Level 1
                         • Request appears in MT Dte dashboard queue
                         • Approves  ──► auto-marked to SD Dte
                         • (or Rejects with reason)
                                     ▼
                         SD Dte Admin (sdbs)  — Final
                         • Request appears in SD Dte dashboard queue
                         • Approves ──► FINAL APPROVED, routed back to JLA
                         • (or Rejects with reason)
                                     ▼
   ┌─────────────────────────  JLA Admin (admin)  ─────────────────────────┐
   │ • Receives the finalized request back                                  │
   │ • Intimates the participant: APPROVED  (or REJECTED with reasons)      │
   └────────────────────────────────────────────────────────────────────────┘

MT Dte can view the LATEST STATUS of every request at any stage (read-through).
```

Step list:
1. User registers (team registration). **Already works.**
2. User submits payment. **Already works.**
3. JLA Admin confirms payment, then **manually marks** the request to MT Dte for Level-1.
4. MT Dte Admin gets the forwarded request on their dashboard → **approves** (L1).
5. On MT Dte approval, request is **auto-marked** to SD Dte Admin.
6. SD Dte Admin **approves** → request is **finally approved** and **marked back to JLA**.
7. MT Dte Admin can **view the latest statuses** of requests throughout.
8. On final SD Dte approval, **JLA intimates the participant** — approved/finalized, or
   rejected **with reasons**.

---

## 4. Current state in code (verification findings — 2026-07-02)

### 4.1 Data model — [prisma/schema.prisma](prisma/schema.prisma) `model User`
Relevant fields only:
```
role                String   @default("user")
approved            Boolean  @default(false)
applicationStatus   String   @default("PENDING")
paymentStatus       String   @default("PENDING")
adminNotes          String?  @db.Text
rejectionReason     String?  @db.Text
rejectedAt          DateTime?
approvedAt          DateTime?
```
- **No** stage / routing / assignee / level fields.
- Only `SupportTicket` has an `assignedTo` relation (unrelated to registrations).
- Related models present: `Payment`, `PaymentRejectionHistory`, `AuditLog`.

### 4.2 Statuses — [src/lib/constants.ts](src/lib/constants.ts)
- `APPLICATION_STATUS = { PENDING, APPROVED, REJECTED }` — **flat, no stages.**
- `PAYMENT_STATUS = { PENDING, SUBMITTED, UNDER_REVIEW, VERIFIED, REJECTED, RETURNED }`.
- Helpers: `normalizePaymentStatus`, `isPaymentVerified`, `isPaymentAwaitingVerification`,
  `canResubmitPayment`, plus label maps.

### 4.3 Registration approval — [src/app/api/admin/users/[id]/route.ts](src/app/api/admin/users/[id]/route.ts) `PUT`
- Guard: `requireRegistrationApprover()` → **admin OR mtd**.
- MTD may only touch the application decision; admin may also change role / suspension /
  paymentStatus / notes / profile.
- Sets `applicationStatus` in ONE step via `buildApplicationUpdateData(status, reason)`
  ([src/lib/payments.ts]) or via the `approved` boolean.
- On newly-approved → `sendRegistrationApprovedEmail({ email, firstName })`.
- Writes `createAuditLog({ action: "application_updated", ... })`.
- **No forwarding, no stages, no SD Dte step.**

### 4.4 Payment verification — [src/app/api/admin/payments/[id]/route.ts](src/app/api/admin/payments/[id]/route.ts) `PUT`
- Guard: `requireAdmin()` → **admin (JLA) only**.
- Updates `payment.status` + mirrors to `user.paymentStatus`.
- On REJECTED/RETURNED → `PaymentRejectionHistory` row.
- On VERIFIED → `sendPaymentConfirmedEmail(participant)`.
- **Does NOT hand off to MT Dte.**

### 4.5 Emails — [src/lib/participant-status-emails.ts](src/lib/participant-status-emails.ts)
- Exists: `sendRegistrationApprovedEmail`, `sendPaymentConfirmedEmail`.
- **Missing:** a registration **rejected** email (needs adding).

### 4.6 Login gating — [src/lib/auth-login.ts](src/lib/auth-login.ts)
- Keys off `applicationStatus` (`APPROVED` allows in, `REJECTED` blocks). The staged flow
  must still resolve to `applicationStatus = APPROVED/REJECTED` at the end to stay compatible.

---

## 5. Gap analysis (target vs current)

| # | Target step | Today | Gap |
|---|---|---|---|
| 1 | User registers + pays | ✅ works | — |
| 2 | JLA confirms payment → mark to MT Dte | ❌ | payment verify doesn't forward |
| 3 | MT Dte L1 approval from a queue | ⚠️ | `mtd` can approve, but globally & directly (no queue, no "forwarded" concept, can approve before payment) |
| 4 | Auto-mark to SD Dte after MT Dte | ❌ | no auto-advance |
| 5 | SD Dte final approval → back to JLA | ❌ | `sdbs` is read-only; no stage tracking |
| 6 | MT Dte can view latest statuses | ⚠️ | can open /admin, but no per-stage view |
| 7 | JLA intimates user (approved / rejected+reason) | ⚠️ | approve/pay emails exist; no rejection email; not JLA-gated after SD Dte |

**Present building blocks:** 3 roles, `AuditLog`, `PaymentRejectionHistory`, participant
emails, `rejectionReason` field. **Absent:** the sequential multi-level routing itself.

---

## 6. Proposed design

### 6.1 Approval stages (new)
Add a fine-grained `approvalStage` alongside the existing coarse `applicationStatus`.
`applicationStatus` stays the terminal/login-facing value; `approvalStage` drives routing.

```
PAYMENT_PENDING   → registered, payment not yet verified
PAYMENT_VERIFIED  → JLA verified payment; awaiting JLA to forward to MT Dte
MT_REVIEW         → with MT Dte (Level 1)
SD_REVIEW         → with SD Dte (Final)
APPROVED          → SD Dte approved; final; routed back to JLA for intimation
REJECTED          → rejected at some stage (see rejectedStage + rejectionReason)
```
Mapping to `applicationStatus`: `PENDING` while stage ∈ {PAYMENT_*, MT_REVIEW, SD_REVIEW};
`APPROVED` when stage = APPROVED; `REJECTED` when stage = REJECTED.

### 6.2 Schema changes — [prisma/schema.prisma](prisma/schema.prisma)
Add to `User`:
```prisma
approvalStage   String    @default("PAYMENT_PENDING")
rejectedStage   String?                 // which stage produced the rejection
forwardedToMtAt DateTime?
mtReviewedAt    DateTime?
sdReviewedAt    DateTime?
@@index([approvalStage])
```
Recommended: a dedicated history model (full audit of who/what/when/why per hop):
```prisma
model RegistrationApproval {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation("RegApprovalSubject", fields: [userId], references: [id], onDelete: Cascade)
  stage     String   // MT_REVIEW | SD_REVIEW | PAYMENT_VERIFIED ...
  action    String   // FORWARDED | APPROVED | REJECTED | INTIMATED
  actorId   String
  actor     User     @relation("RegApprovalActor", fields: [actorId], references: [id])
  reason    String?  @db.Text
  createdAt DateTime @default(now())
  @@index([userId])
  @@index([stage])
}
```
(`AuditLog` can complement this, but the dedicated model powers per-stage dashboards.)

### 6.3 Constants — [src/lib/constants.ts](src/lib/constants.ts)
Add `APPROVAL_STAGE` map + `APPROVAL_STAGE_LABELS` + helpers (`isTerminalStage`,
`nextStageAfterMtApprove = SD_REVIEW`, etc.).

### 6.4 Permissions — [src/lib/auth-routes.ts](src/lib/auth-routes.ts)
- Update `ROLE_LABELS`: `admin → "JLA Admin"`, `mtd → "MT Dte (L1 approver)"`,
  `sdbs → "SD Dte (final approver)"`.
- **Upgrade `sdbs` from viewer to approver** (default decision — see §7).
- Add stage-gated helpers, e.g.:
  - `canVerifyPayment(role)          = admin`
  - `canForwardToMt(role)           = admin`            (JLA marks manually)
  - `canApproveAtMt(role)           = mtd  (|| admin override)`
  - `canApproveAtSd(role)           = sdbs (|| admin override)`
  - `canIntimateParticipant(role)   = admin`
- Replace/retire `canApproveRegistration` in favour of the stage-aware checks.
- Decide admin-override policy (recommend: JLA can act at any stage as override + always read-all).

### 6.5 Transition logic
| Trigger | Actor | Guard | Effect |
|---|---|---|---|
| Verify payment | JLA | payment submitted | `paymentStatus=VERIFIED`; stage → `PAYMENT_VERIFIED`; email participant (existing) |
| Forward to MT Dte | JLA | stage=PAYMENT_VERIFIED | stage → `MT_REVIEW`; `RegistrationApproval(FORWARDED)`; (optional) notify MT Dte |
| Approve L1 | MT Dte | stage=MT_REVIEW | stage → `SD_REVIEW` (auto-advance); `RegistrationApproval(APPROVED@MT)`; (optional) notify SD Dte |
| Reject / return | MT Dte | stage=MT_REVIEW | `applicationStatus=REJECTED`, `rejectedStage=MT_REVIEW`, reason; route to JLA |
| Approve final | SD Dte | stage=SD_REVIEW | `applicationStatus=APPROVED`, `approved=true`, `approvedAt`, stage → `APPROVED`; `RegistrationApproval(APPROVED@SD)`; flag to JLA |
| Reject | SD Dte | stage=SD_REVIEW | `applicationStatus=REJECTED`, `rejectedStage=SD_REVIEW`, reason; route to JLA |
| Intimate participant | JLA | stage ∈ {APPROVED, REJECTED} | send participant email (approved / rejected+reason); `RegistrationApproval(INTIMATED)` |

Every transition writes an audit entry. All transitions are **role-AND-stage gated** so a
step can't be skipped (e.g., MT Dte can't act unless stage=MT_REVIEW).

### 6.6 Dashboards ([src/app/(admin)/admin/](src/app/(admin)/admin/))
- **JLA (admin):** payment queue → verify; "Verified, ready to forward" queue → *Forward to MT Dte*; "Finalized (SD approved / rejected)" queue → *Intimate participant*; full read of all stages.
- **MT Dte (mtd):** "Awaiting my L1 approval" queue (stage=MT_REVIEW) with Approve/Reject; read-through view of every request's latest stage.
- **SD Dte (sdbs):** "Awaiting my final approval" queue (stage=SD_REVIEW) with Approve/Reject.
- Add an `approvalStage` **column + filter** to [admin/users](src/app/(admin)/admin/users/page.tsx).

### 6.7 Emails — [src/lib/participant-status-emails.ts](src/lib/participant-status-emails.ts)
- Reuse `sendRegistrationApprovedEmail` (final approval), `sendPaymentConfirmedEmail`.
- **Add** `sendRegistrationRejectedEmail({ email, firstName, reason })`.
- Optional internal notifications to MT Dte / SD Dte on hand-off (email or dashboard badge).

### 6.8 Validation — [src/lib/validations.ts](src/lib/validations.ts)
Add schemas for the new transition endpoints (forward, mt-approve, sd-approve, reject —
reject requires a non-empty reason).

---

## 7. Open decisions (with recommended defaults)

1. **Payment → MT Dte hand-off:** manual by JLA *(default)* vs auto on payment verify.
2. **SD Dte role:** upgrade `sdbs` to final approver *(default)* vs keep viewer + new role.
3. **Rejections:** any stage (MT or SD) can reject with a reason *(default)* vs only SD/JLA.
4. **Final intimation:** JLA-triggered manual "Intimate" action *(default, matches wording)*
   vs auto-email on final decision. (Could also do both: auto-email + JLA sees confirmation.)

Other rules to nail down before/while building:
- **Resubmission:** can a REJECTED request re-enter the flow? (Payment `RETURNED` already
  allows re-upload.) Define the stage reset.
- **Payment rejected after forwarding:** what happens to an in-flight MT/SD request?
- **Admin override:** may JLA act at any stage? (Recommend yes + always read-all.)
- **International vs local teams:** any different routing? (Confirm; `intlRegistrationOpen`
  exists in settings.)

---

## 8. Implementation checklist (ordered)

- [ ] **Schema:** add `approvalStage` (+ reviewer timestamps, `rejectedStage`) and the
      `RegistrationApproval` model to [schema.prisma](prisma/schema.prisma).
- [ ] **Migration + backfill:** `prisma migrate` (or `db push`) + script:
      APPROVED→stage=APPROVED; REJECTED→stage=REJECTED; PENDING+paymentVERIFIED→PAYMENT_VERIFIED;
      else PAYMENT_PENDING.
- [ ] **Constants:** `APPROVAL_STAGE` map, labels, helpers in [constants.ts](src/lib/constants.ts).
- [ ] **Permissions:** update labels + add stage-gated helpers; upgrade `sdbs`
      in [auth-routes.ts](src/lib/auth-routes.ts).
- [ ] **API — payments:** keep verify (JLA); ensure it sets stage=PAYMENT_VERIFIED
      ([payments/[id]/route.ts](src/app/api/admin/payments/[id]/route.ts)).
- [ ] **API — transitions:** new endpoint(s) for forward / mt-approve / sd-approve / reject,
      role+stage gated, writing `RegistrationApproval` + `AuditLog`
      (extend or replace [users/[id]/route.ts](src/app/api/admin/users/[id]/route.ts)).
- [ ] **Validation:** schemas in [validations.ts](src/lib/validations.ts) (reject requires reason).
- [ ] **Dashboards:** MT Dte queue, SD Dte queue, JLA forward + finalize/intimate;
      add stage column/filter to [admin/users](src/app/(admin)/admin/users/page.tsx).
- [ ] **Emails:** add `sendRegistrationRejectedEmail`; optional internal hand-off notifications.
- [ ] **Login compatibility:** confirm [auth-login.ts](src/lib/auth-login.ts) still keys off
      terminal `applicationStatus`.
- [ ] **Verify** the full path end-to-end (register → pay → verify → forward → MT approve →
      SD approve → JLA intimate) plus rejection at each stage.

---

## 9. File map (where things live today)

| Concern | File |
|---|---|
| User/Payment/Audit models | [prisma/schema.prisma](prisma/schema.prisma) |
| Statuses + helpers | [src/lib/constants.ts](src/lib/constants.ts) |
| Roles + permission helpers | [src/lib/auth-routes.ts](src/lib/auth-routes.ts) |
| Registration approval API | [src/app/api/admin/users/[id]/route.ts](src/app/api/admin/users/[id]/route.ts) |
| Payment verification API | [src/app/api/admin/payments/[id]/route.ts](src/app/api/admin/payments/[id]/route.ts) |
| Application update builder | [src/lib/payments.ts](src/lib/payments.ts) |
| Payment status update builder | [src/lib/payment-status-update.ts](src/lib/payment-status-update.ts) |
| Participant emails | [src/lib/participant-status-emails.ts](src/lib/participant-status-emails.ts) |
| Audit logging | [src/lib/audit.ts](src/lib/audit.ts) |
| API guards (requireAdmin, etc.) | [src/lib/api-helpers.ts](src/lib/api-helpers.ts) |
| Zod schemas | [src/lib/validations.ts](src/lib/validations.ts) |
| Login gating | [src/lib/auth-login.ts](src/lib/auth-login.ts) |
| Admin console pages | [src/app/(admin)/admin/](src/app/(admin)/admin/) (`users`, `payments`, `user-management`, …) |

---

## 10. Notes
- **Backward compatibility:** the login flow and any existing dashboards read
  `applicationStatus`; keep it authoritative for the terminal decision. `approvalStage`
  is additive and drives routing/queues only.
- **No code has been changed** to implement this yet — this is spec only.
- When ready, say **"build it"** (uses the §7 defaults) or **"plan it"** for a
  finer-grained task breakdown before coding.
