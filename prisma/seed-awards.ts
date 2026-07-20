/**
 * Seeds the exercise results roll (`Award`) from the transcribed board.
 *
 * Idempotent per (callSign, year): re-running updates unit/medal/order in place
 * rather than duplicating rows, so correcting a typo in `awards-data.ts` and
 * re-seeding is safe. Run with: npm run db:seed:awards
 */
import { PrismaClient } from "@prisma/client";

import { AWARDS_ROLL, AWARDS_ROLL_YEAR } from "../src/lib/awards-data";

const prisma = new PrismaClient();

async function main() {
  console.log(
    `Seeding ${AWARDS_ROLL.length} award rows for year ${AWARDS_ROLL_YEAR}…`
  );

  let created = 0;
  let updated = 0;

  for (const [index, row] of AWARDS_ROLL.entries()) {
    const existing = await prisma.award.findFirst({
      where: { callSign: row.callSign, year: AWARDS_ROLL_YEAR },
      select: { id: true },
    });

    const data = {
      callSign: row.callSign,
      unit: row.unit,
      medal: row.medal,
      year: AWARDS_ROLL_YEAR,
      sortOrder: index,
      published: true,
    };

    if (existing) {
      await prisma.award.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.award.create({ data });
      created += 1;
    }
  }

  console.log(`Awards seed complete — ${created} created, ${updated} updated.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
