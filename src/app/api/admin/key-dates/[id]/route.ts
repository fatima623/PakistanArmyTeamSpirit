import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateKeyDatesPaths } from "@/lib/revalidate-public";
import { KeyDateSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

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

    const keyDate = await prisma.keyDate.update({
      where: { id },
      data: parsed.data,
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

    revalidateKeyDatesPaths();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
