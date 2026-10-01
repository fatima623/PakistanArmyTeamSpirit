import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { revalidateFaqPaths } from "@/lib/revalidate-public";
import { FaqSchema } from "@/lib/validations";
import {
  autoTranslateMissing,
  buildTranslationSeed,
  parseTranslationsInput,
  saveTranslations,
} from "@/lib/admin-translations";
import { deleteTranslationsFor } from "@/lib/i18n/content-translations";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

/** Existing translations + staleness, for the manager's edit row. */
export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      throw new ApiError("FAQ not found", 404);
    }

    const translations = await buildTranslationSeed("Faq", id, {
      question: faq.question,
      answer: faq.answer,
    });

    return NextResponse.json({ translations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = FaqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("FAQ not found", 404);
    }

    const translations = parseTranslationsInput("Faq", body?.translations);

    const faq = await prisma.faq.update({
      where: { id },
      data: parsed.data,
    });

    // Hash the English saved by THIS request, not `existing` — otherwise every
    // translation would be marked stale the moment the English is edited.
    await saveTranslations({
      model: "Faq",
      recordId: id,
      translations,
      source: { question: faq.question, answer: faq.answer },
    });
    await autoTranslateMissing("Faq", id, {
      question: { text: faq.question },
      answer: { text: faq.answer },
    });

    revalidateFaqPaths();

    return NextResponse.json({ faq });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("FAQ not found", 404);
    }

    await prisma.faq.delete({ where: { id } });
    // No FK on Translation — orphan rows are this route's responsibility.
    await deleteTranslationsFor("Faq", id);

    revalidateFaqPaths();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
