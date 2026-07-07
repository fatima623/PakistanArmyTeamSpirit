# Participant Workflow v2 — Implementation Notes

> Implemented **2026-07-06**. Revised registration & approval process with a guided,
> stage-by-stage participant journey and strict role-based verification.

## ⚠️ Before running

```bash
npx prisma migrate dev     # applies prisma/migrations/20260706090000_participant_workflow_v2
npx prisma generate        # regenerate the client (npm run dev/build also does this)
```

The migration adds columns to `User`, `TeamMember`, `SiteSettings` and creates
`TeamSizeRequest` + `FlightDetail`. No data backfill is required — all existing
participants will see the confirmation dialog on next login (as requested).

## Participant journey (each stage unlocks the next)

| # | Stage | Gate | Where |
|---|-------|------|-------|
| 1 | **Confirm Participation** | First login dialog with countdown to `participationConfirmDeadline`. Confirm → dashboard. Reject → signed out to login (may return until deadline). After deadline: confirm disabled. | `/event/confirm-participation` |
| 2 | **Registration Verification** | Decided **only by SD**. Statuses: Pending / Under Review / Approved / Rejected / Returned for Correction. | `/admin/users/[id]` |
| 3 | **Payment** | Proof upload; verified **only by MT**. | `/event/payment`, `/admin/payments` |
| 4 | **Team Registration** | Only inside the admin-configured window (`teamRegistrationOpenDate` → `teamRegistrationCloseDate`). | `/event/team` |
| 5 | **Team Members** | Editable table (S.No, Serial Number, Rank, Full Name, Gender). Cap = `maxTeamMembers` (13) or per-user override. At cap → "Request Additional Team Members" → justification to Admin. "Mark roster complete" unlocks flights. | `/event/team` |
| 6 | **Flight Details** | Per-traveler (linked to roster): Passenger Name, Passport Number, Passport PDF, Ticket PDF (validated, 10MB, magic-byte checked). Editable until `flightDetailsDeadline` or admin finalization. | `/event/flights`, `/admin/flights` |
| 7 | **Host Information** | Read-only dashboard (country-wise team numbers, own team, finalized flights, organizer content). Visible when flights finalized **and** `hostInfoPublished`. | `/event/host-info` |

## Role matrix

| Action | Admin | SD (`sdbs`) | MT (`mtd`) |
|---|---|---|---|
| Registration verification (approve/reject/return/under-review) | view | **decide** | view |
| Payment verification | view | view | **decide** |
| Team-size requests | **decide** | view | view |
| Flight finalize / unlock | **decide** | view | view |
| Settings, roles, accounts, suspension, notes | **decide** | – | – |

Enforced server-side in `src/lib/auth-routes.ts` (`canApproveRegistration` = SD,
`canVerifyPayment` = MT), `api-helpers.ts` (`requireRegistrationApprover`,
`requirePaymentVerifier`), and per-field checks in
`api/admin/users/[id]` + `api/admin/payments/[id]`. Every decision writes an
`AuditLog` entry with `actorRole` (shown in Activity history panels).

## Admin configuration (Site Settings → "Participant workflow" / "Host information")

`participationConfirmDeadline`, `teamRegistrationOpenDate`,
`teamRegistrationCloseDate`, `flightDetailsDeadline`, `maxTeamMembers`,
`hostInfoPublished`, `hostInfoContent`. Empty window bounds = unbounded on that side.

## New admin pages
- `/admin/team-requests` — team-size request queue (Admin decides, staff view).
- `/admin/flights` — flight document review + per-participant Finalize/Unlock.

## Key files
- Workflow engine: `src/lib/participant-workflow.ts` (+ `workflow-settings.ts`, fresh reads)
- Guards: `src/lib/roster-guard.ts`, `src/lib/flights.ts`, `require-participant.ts` (`requireConfirmedParticipant`)
- Storage: `src/lib/storage/flight-doc.ts` (root `uploads/flight-docs`, env `FLIGHT_DOC_STORAGE_DIR`)
- Participant APIs: `api/user/participation`, `team-registration`, `team-roster`, `team-members` (PUT added), `team-size-request`, `flights[...]`
- Admin APIs: `api/admin/team-size-requests[...]`, `api/admin/flights[...]`
- UI: `ParticipationConfirmCard`, `ParticipantWorkflowPanel`, `TeamRosterManager`, `FlightDetailsManager`, `TeamSizeRequestsBoard`, `FlightReviewBoard`

## Notes
- `TeamMember.serviceNumber` is relabeled **Serial Number** in the UI; `rank` is new; `serviceArm` is now optional.
- `APPLICATION_STATUS` gained `UNDER_REVIEW` and `RETURNED`. Login is blocked only for `REJECTED`.
- Payment auto "under review" on open now happens only when an MT member opens the proof.
- `tsconfig.check.json` is a scoped typecheck config used during development; safe to delete.
