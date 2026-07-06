import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UnitUpdateSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  requireAuth,
  requireJsonContentType,
  userSelect,
} from "@/lib/api-helpers";

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = UnitUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userId = session.user.id;

    const existingUnit = await prisma.unit.findUnique({ where: { userId } });
    if (!existingUnit) {
      throw new ApiError("Unit not found", 404);
    }

    const user = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          rank: data.rank,
        },
      });

      await tx.unit.update({
        where: { userId },
        data: {
          unitType: data.unitType,
          jointPatrol: data.jointPatrol,
          branch: data.branch,
          unitName: data.unitName,
          bdeOrFmn: data.bdeOrFmn,
          divOrFmn: data.divOrFmn,
          arm: data.arm,
          service: data.service,
          unitAddress: data.unitAddress,
          postcode: data.postcode,
          telephoneMil: data.telephoneMil,
          telephoneCiv: data.telephoneCiv,
          secondPocEmail: data.secondPocEmail || null,
          thirdPocEmail: data.thirdPocEmail || null,
          additionalInfo: data.additionalInfo ?? null,
          coName: data.coName,
          coEmail: data.coEmail,
          coPhone: data.coPhone,
          coRank: data.coRank,
          coSalutations: data.coSalutations ?? null,
        },
      });

      return tx.user.findUnique({
        where: { id: userId },
        select: { ...userSelect, unit: true },
      });
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
