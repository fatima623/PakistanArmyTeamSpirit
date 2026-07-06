import { NextResponse } from "next/server";

import { handleApiError, requireStaff } from "@/lib/api-helpers";
import { getStatusDistribution } from "@/lib/admin-dashboard-charts";

export async function GET() {
  try {
    await requireStaff();
    const { data, total } = await getStatusDistribution();
    return NextResponse.json({ data, total });
  } catch (error) {
    return handleApiError(error);
  }
}
