import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { revalidateFaqPaths } from "@/lib/revalidate-public";
import { FaqSchema } from "@/lib/validations";
import {
  autoTranslateMissing,
  parseTranslationsInput,
  saveTranslations,
} from "@/lib/admin-translations";
import {
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";

export async function GET() {
  try {
    await requireAdmin();

    const faqs = await prisma.faq.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = FaqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Validate before creating: a bad locale/field must 400 without leaving an
    // FAQ behind.
    const translations = parseTranslationsInput("Faq", body?.translations);

    const faq = await prisma.faq.create({
      data: parsed.data,
    });

    await saveTranslations({
      model: "Faq",
      recordId: faq.id,
      translations,
      source: { question: faq.question, answer: faq.answer },
    });
    // Auto-translate anything the admin left blank, where the engine is on.
    await autoTranslateMissing("Faq", faq.id, {
      question: { text: faq.question },
      answer: { text: faq.answer },
    });

    revalidateFaqPaths();

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
