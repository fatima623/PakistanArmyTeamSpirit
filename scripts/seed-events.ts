/**
 * Seed the Event catalogue from the canonical CONTOUR_EVENTS list.
 * Idempotent (upsert by slug). Run: `npx tsx scripts/seed-events.ts`.
 */
import { Prisma, PrismaClient } from "@prisma/client";

import { CONTOUR_EVENTS } from "../src/lib/exercise-contour";

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let updated = 0;

  for (let i = 0; i < CONTOUR_EVENTS.length; i++) {
    const e = CONTOUR_EVENTS[i];
    const base = {
      title: e.title,
      marks: e.marks,
      icon: e.icon,
      category: e.category,
      difficulty: e.difficulty,
      duration: e.duration,
      summary: e.summary,
      details: e.details,
      participants: e.participants ?? null,
      sortOrder: i,
      published: true,
    };
    const breakdownValue: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      e.breakdown && e.breakdown.length
        ? (e.breakdown as Prisma.InputJsonValue)
        : Prisma.JsonNull;

    const existing = await prisma.event.findUnique({ where: { slug: e.id } });
    await prisma.event.upsert({
      where: { slug: e.id },
      create: { slug: e.id, ...base, breakdown: breakdownValue },
      update: { ...base, breakdown: breakdownValue },
    });
    if (existing) updated++;
    else created++;
  }

  console.log(
    `Events seed complete — ${created} created, ${updated} updated (total ${CONTOUR_EVENTS.length}).`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
