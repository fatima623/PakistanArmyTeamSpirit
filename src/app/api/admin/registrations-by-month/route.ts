import { NextResponse } from "next/server";

import { handleApiError, requireStaff } from "@/lib/api-helpers";
import {
  getRegistrationsByMonth,
  parseRegistrationRange,
} from "@/lib/admin-dashboard-charts";

export async function GET(request: Request) {
  try {
    await requireStaff();
    const { searchParams } = new URL(request.url);
    const range = parseRegistrationRange(searchParams.get("range"));
    const data = await getRegistrationsByMonth(range);
    return NextResponse.json({ data, range });
  } catch (error) {
    return handleApiError(error);
  }
}
