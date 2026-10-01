import { createHash } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import { tickets as enTickets } from "../src/lib/i18n/dictionaries/en/tickets";
import { tickets as ruTickets } from "../src/lib/i18n/dictionaries/ru/tickets";
import { tickets as trTickets } from "../src/lib/i18n/dictionaries/tr/tickets";
import { tickets as arTickets } from "../src/lib/i18n/dictionaries/ar/tickets";
import { tickets as zhTickets } from "../src/lib/i18n/dictionaries/zh/tickets";

/**
 * Seed the admin-managed `Faq` table from the former static i18n
 * `tickets.faq.items`, preserving the existing ru/tr/ar/zh translations by
 * writing them into the polymorphic `Translation` table (model "Faq").
 *
 * Idempotent: rows use deterministic ids (`faq-seed-<index>`) so re-running
 * updates in place rather than duplicating, and the translation recordIds stay
 * stable across runs.
 *
 *   npx tsx prisma/seed-faqs.ts
 *
 * Safe to run against a populated database — it only touches the seeded rows
 * (those with a `faq-seed-` id) and their translations. Admin-created FAQs (cuid
 * ids) are never affected.
 */

const prisma = new PrismaClient();

/** Mirrors content-translations.sourceHashOf — sha256(trimmed utf8) hex. */
function sourceHashOf(value: string): string {
  return createHash("sha256").update(value.trim(), "utf8").digest("hex");
}

const LOCALE_ITEMS = {
  ru: ruTickets.faq.items,
  tr: trTickets.faq.items,
  ar: arTickets.faq.items,
  zh: zhTickets.faq.items,
} as const;

async function main() {
  const enItems = enTickets.faq.items;
  console.log(`Seeding ${enItems.length} FAQ entries…`);

  for (let i = 0; i < enItems.length; i++) {
    const en = enItems[i];
    const id = `faq-seed-${i}`;

    await prisma.faq.upsert({
      where: { id },
      create: {
        id,
        question: en.q,
        answer: en.a,
        sortOrder: i,
        published: true,
      },
      update: {
        question: en.q,
        answer: en.a,
        sortOrder: i,
      },
    });

    const questionHash = sourceHashOf(en.q);
    const answerHash = sourceHashOf(en.a);

    for (const [locale, items] of Object.entries(LOCALE_ITEMS)) {
      const t = items[i];
      if (!t) continue;

      for (const [field, value, hash] of [
        ["question", t.q, questionHash],
        ["answer", t.a, answerHash],
      ] as const) {
        if (!value?.trim()) continue;
        await prisma.translation.upsert({
          where: {
            model_recordId_locale_field: {
              model: "Faq",
              recordId: id,
              locale,
              field,
            },
          },
          create: {
            model: "Faq",
            recordId: id,
            locale,
            field,
            value,
            sourceHash: hash,
          },
          update: { value, sourceHash: hash },
        });
      }
    }
  }

  const total = await prisma.faq.count();
  console.log(`Done. ${total} FAQ row(s) in the database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
