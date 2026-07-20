import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateKeyDatesPaths } from "@/lib/revalidate-public";
import { KeyDateSchema } from "@/lib/validations";
import {
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

    const keyDates = await prisma.keyDate.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ keyDates });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = KeyDateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Validate before creating: a bad locale/field must 400 without leaving a
    // key date behind.
    const translations = parseTranslationsInput("KeyDate", body?.translations);

    const keyDate = await prisma.keyDate.create({
      data: parsed.data,
    });

    await saveTranslations({
      model: "KeyDate",
      recordId: keyDate.id,
      translations,
      source: { label: keyDate.label, value: keyDate.value },
    });

    revalidateKeyDatesPaths();

    return NextResponse.json({ keyDate }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
