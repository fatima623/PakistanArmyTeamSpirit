import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  requireAuth,
  requireJsonContentType,
  userSelect,
} from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        privacyAccepted: true,
        privacyAcceptedAt: new Date(),
      },
      select: userSelect,
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
