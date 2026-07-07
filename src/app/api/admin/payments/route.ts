import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireStaff } from "@/lib/api-helpers";

/** All staff (Admin, SD, MT) may view the payment verification queue. */
export async function GET(request: Request) {
  try {
    await requireStaff();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search") ?? "";

    const where: Prisma.PaymentWhereInput = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { transactionReference: { contains: search } },
        {
          user: {
            OR: [
              { email: { contains: search } },
              { firstName: { contains: search } },
              { lastName: { contains: search } },
            ],
          },
        },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            country: true,
            nationality: true,
            unit: { select: { unitName: true } },
          },
        },
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    return handleApiError(error);
  }
}
