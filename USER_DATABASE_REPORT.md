# Database user report

Generated: 2026-07-17T03:05:11.096Z

Total users: **19**

| Name | Email | Role | Application | Payment | Created (UTC) | Suspended |
|------|-------|------|-------------|---------|---------------|-----------|
| HQ Admin | admin123@example.com | admin | APPROVED | VERIFIED | 2026-06-09 07:48:07 UTC | no |
| HQ Admin | admin@example.com | admin | APPROVED | VERIFIED | 2026-06-29 15:48:59 UTC | no |
| sdwdw qwqdqw | fatimaattique32@gmail.com | host | APPROVED | VERIFIED | 2026-07-14 09:36:25 UTC | no |
| Maya Approver | mtd@example.com | mtd | APPROVED | VERIFIED | 2026-06-29 15:49:00 UTC | no |
| Sam Viewer | sdbs@example.com | sdbs | APPROVED | VERIFIED | 2026-06-29 15:49:00 UTC | no |
| Pat peter | pending@example.com | user | APPROVED | PENDING | 2026-06-09 07:48:08 UTC | no |
| Ann Approved | approved@example.com | user | APPROVED | PENDING | 2026-06-09 07:48:08 UTC | no |
| Pay Submitted | payment@example.com | user | APPROVED | UNDER_REVIEW | 2026-06-09 07:48:08 UTC | no |
| Val Verified | verified@example.com | user | APPROVED | VERIFIED | 2026-06-09 07:48:09 UTC | no |
| Reg Rejected | rejected@example.com | user | REJECTED | PENDING | 2026-06-09 07:48:09 UTC | no |
| Fatima Attique | fatimaattique03@gmail.com | user | PENDING | PENDING | 2026-06-29 08:14:24 UTC | no |
| Fatima Attique | fattique4@gmail.com | user | APPROVED | PENDING | 2026-06-29 08:19:25 UTC | no |
| Fatima Attique | fatimaattique08@gmail.com | user | APPROVED | PENDING | 2026-06-30 07:44:26 UTC | no |
| Fatima Attique | fatimaattique05@gmail.com | user | APPROVED | VERIFIED | 2026-07-07 07:25:16 UTC | no |
| Fatima Attique | fatimaattique01@gmail.com | user | APPROVED | VERIFIED | 2026-07-10 12:02:56 UTC | no |
| Test check | testing@gmail.com | user | PENDING | PENDING | 2026-07-12 06:01:23 UTC | no |
| cfcvb sdfgv | test@gmail.com | user | APPROVED | VERIFIED | 2026-07-12 06:03:44 UTC | no |
| Fatima Attique | fatimaattique1@gmail.com | user | APPROVED | VERIFIED | 2026-07-14 04:28:20 UTC | no |
| fatima Attique | fatimaattique2@gmail.com | user | APPROVED | SUBMITTED | 2026-07-14 06:28:25 UTC | no |

## Seeded test accounts (expected after `npx prisma db seed`)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin123! | admin |
| pending@example.com | TestPass123! | user (PENDING) |
| approved@example.com | TestPass123! | user (APPROVED / payment PENDING) |
| payment@example.com | TestPass123! | user (payment SUBMITTED) |
| verified@example.com | TestPass123! | user (payment APPROVED) |
| rejected@example.com | TestPass123! | user (REJECTED) |
