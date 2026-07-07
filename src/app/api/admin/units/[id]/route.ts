import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdminUnitUpdateSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
  userSelect,
} from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        user: { select: userSelect },
      },
    });

    if (!unit) {
      throw new ApiError("Unit not found", 404);
    }

    return NextResponse.json({ unit });
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
    const parsed = AdminUnitUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.unit.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      throw new ApiError("Unit not found", 404);
    }

    const data = parsed.data;

    const unit = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existing.userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          rank: data.rank,
        },
      });

      return tx.unit.update({
        where: { id },
        data: {
          unitType: data.unitType,
          branch: data.branch,
          unitName: data.unitName,
          arm: data.arm,
          secondPocEmail: data.secondPocEmail || null,
          thirdPocEmail: data.thirdPocEmail || null,
          additionalInfo: data.additionalInfo ?? null,
          coName: data.coName,
          coEmail: data.coEmail,
          coPhone: data.coPhone,
          ...(data.preferredPhase !== undefined && {
            preferredPhase: data.preferredPhase,
          }),
          ...(data.patrolsRequested !== undefined && {
            patrolsRequested: data.patrolsRequested,
          }),
        },
        include: {
          user: { select: userSelect },
        },
      });
    });

    return NextResponse.json({ unit });
  } catch (error) {
    return handleApiError(error);
  }
}
