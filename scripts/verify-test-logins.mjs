/**
 * Verifies bcrypt passwords for seeded test accounts.
 * Run: node scripts/verify-test-logins.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ACCOUNTS = [
  { email: "admin@example.com", password: "Admin123!" },
  { email: "pending@example.com", password: "TestPass123!" },
  { email: "approved@example.com", password: "TestPass123!" },
  { email: "payment@example.com", password: "TestPass123!" },
  { email: "verified@example.com", password: "TestPass123!" },
  { email: "rejected@example.com", password: "TestPass123!" },
];

async function main() {
  let failed = 0;
  for (const { email, password } of ACCOUNTS) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { email: true, role: true, passwordHash: true, suspended: true },
    });
    if (!user) {
      console.log(`FAIL  ${email} — user not found`);
      failed++;
      continue;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log(`FAIL  ${email} — password mismatch`);
      failed++;
      continue;
    }
    console.log(`OK    ${email} (${user.role})${user.suspended ? " [suspended]" : ""}`);
  }
  if (failed > 0) {
    process.exit(1);
  }
  console.log("\nAll test logins verified.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
