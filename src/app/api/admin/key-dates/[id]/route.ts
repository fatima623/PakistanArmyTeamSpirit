import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateKeyDatesPaths } from "@/lib/revalidate-public";
import { KeyDateSchema } from "@/lib/validations";
import {
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

    const keyDate = await prisma.keyDate.findUnique({ where: { id } });
    if (!keyDate) {
      throw new ApiError("Key date not found", 404);
    }

    const translations = await buildTranslationSeed("KeyDate", id, {
      label: keyDate.label,
      value: keyDate.value,
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
    const parsed = KeyDateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.keyDate.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Key date not found", 404);
    }

    const translations = parseTranslationsInput("KeyDate", body?.translations);

    const keyDate = await prisma.keyDate.update({
      where: { id },
      data: parsed.data,
    });

    // Hash the English saved by THIS request, not `existing` — otherwise every
    // translation would be marked stale the moment the English is edited.
    await saveTranslations({
      model: "KeyDate",
      recordId: id,
      translations,
      source: { label: keyDate.label, value: keyDate.value },
    });

    revalidateKeyDatesPaths();

    return NextResponse.json({ keyDate });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.keyDate.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Key date not found", 404);
    }

    await prisma.keyDate.delete({ where: { id } });
    // No FK on Translation — orphan rows are this route's responsibility.
    await deleteTranslationsFor("KeyDate", id);

    revalidateKeyDatesPaths();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
