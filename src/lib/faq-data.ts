import "server-only";

import type { Locale } from "@/lib/i18n/config";
import {
  applyTranslations,
  getTranslations,
} from "@/lib/i18n/content-translations";
import { prisma } from "@/lib/prisma";

/** One FAQ entry in the shape the FaqAccordion renders. */
export type FaqListItem = { q: string; a: string };

/**
 * Published FAQ entries for the participant view, localized to `locale`.
 *
 * English lives on the `Faq` row; ru/tr/ar/zh come from the polymorphic
 * `Translation` table and fall back to English per field when absent. The read
 * is wrapped so a database hiccup degrades to an empty FAQ block rather than
 * taking the session-gated queries page down — the accordion hides itself when
 * there are no items.
 */
export async function getPublishedFaqs(locale: Locale): Promise<FaqListItem[]> {
  try {
    const faqs = await prisma.faq.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, question: true, answer: true },
    });
    if (faqs.length === 0) return [];

    const translations = await getTranslations(
      "Faq",
      faqs.map((f) => f.id),
      locale
    );

    return faqs.map((faq) => {
      const localized = applyTranslations(faq, translations.get(faq.id));
      return { q: localized.question, a: localized.answer };
    });
  } catch (error) {
    console.error("[faq-data] getPublishedFaqs failed:", error);
    return [];
  }
}
