/**
 * Lists all users in the database for review.
 * Run: node scripts/list-users.mjs
 */
import { PrismaClient } from "@prisma/client";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function formatDate(d) {
  return d ? d.toISOString().replace("T", " ").slice(0, 19) + " UTC" : "—";
}

async function main() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      applicationStatus: true,
      paymentStatus: true,
      createdAt: true,
      suspended: true,
    },
  });

  const lines = [
    "# Database user report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Total users: **${users.length}**`,
    "",
    "| Name | Email | Role | Application | Payment | Created (UTC) | Suspended |",
    "|------|-------|------|-------------|---------|---------------|-----------|",
  ];

  for (const u of users) {
    const name = `${u.firstName} ${u.lastName}`.replace(/\|/g, "\\|");
    lines.push(
      `| ${name} | ${u.email} | ${u.role} | ${u.applicationStatus} | ${u.paymentStatus} | ${formatDate(u.createdAt)} | ${u.suspended ? "yes" : "no"} |`
    );
  }

  lines.push("");
  lines.push("## Seeded test accounts (expected after `npx prisma db seed`)");
  lines.push("");
  lines.push("| Email | Password | Role |");
  lines.push("|-------|----------|------|");
  lines.push("| admin@example.com | Admin123! | admin |");
  lines.push("| pending@example.com | TestPass123! | user (PENDING) |");
  lines.push("| approved@example.com | TestPass123! | user (APPROVED / payment PENDING) |");
  lines.push("| payment@example.com | TestPass123! | user (payment SUBMITTED) |");
  lines.push("| verified@example.com | TestPass123! | user (payment APPROVED) |");
  lines.push("| rejected@example.com | TestPass123! | user (REJECTED) |");
  lines.push("");

  const report = lines.join("\n");
  const outPath = path.join(root, "USER_DATABASE_REPORT.md");
  await writeFile(outPath, report, "utf8");
  console.log(report);
  console.log(`\nWritten to ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
