import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SiteSettingsSchema } from "@/lib/validations";
import {
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: {
        id: "singleton",
        feeNoticeText: "",
        approvalNoticeText: "",
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = SiteSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: {
        id: "singleton",
        ...parsed.data,
      },
    });

    revalidatePath("/");
    revalidatePath("/key-dates");
    revalidatePath("/page/key-dates");
    revalidatePath("/event/dashboard");
    revalidatePath("/event/payment");
    revalidatePath("/event/team");
    revalidatePath("/event/flights");
    revalidatePath("/event/host-info");
    revalidatePath("/event/confirm-participation");

    return NextResponse.json({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}
