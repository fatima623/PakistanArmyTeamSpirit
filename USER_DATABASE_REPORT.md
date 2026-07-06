# Database user report

Generated: 2026-05-19T05:01:52.390Z

Total users: **7**

| Name | Email | Role | Application | Payment | Created (UTC) | Suspended |
|------|-------|------|-------------|---------|---------------|-----------|
| HQ Admin | admin@example.com | admin | APPROVED | APPROVED | 2026-05-19 05:01:51 UTC | no |
| John Perry | jedix85812@getasail.com | user | APPROVED | PENDING | 2026-05-19 04:37:19 UTC | no |
| Pat Pending | pending@example.com | user | PENDING | PENDING | 2026-05-19 05:01:51 UTC | no |
| Ann Approved | approved@example.com | user | APPROVED | PENDING | 2026-05-19 05:01:51 UTC | no |
| Pay Submitted | payment@example.com | user | APPROVED | SUBMITTED | 2026-05-19 05:01:51 UTC | no |
| Val Verified | verified@example.com | user | APPROVED | APPROVED | 2026-05-19 05:01:51 UTC | no |
| Reg Rejected | rejected@example.com | user | REJECTED | PENDING | 2026-05-19 05:01:51 UTC | no |

## Seeded test accounts (expected after `npx prisma db seed`)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin123! | admin |
| pending@example.com | TestPass123! | user (PENDING) |
| approved@example.com | TestPass123! | user (APPROVED / payment PENDING) |
| payment@example.com | TestPass123! | user (payment SUBMITTED) |
| verified@example.com | TestPass123! | user (payment APPROVED) |
| rejected@example.com | TestPass123! | user (REJECTED) |
