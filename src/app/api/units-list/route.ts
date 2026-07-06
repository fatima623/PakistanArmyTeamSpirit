import { NextResponse } from "next/server";
import { UNIT_NAMES } from "@/lib/units-list";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    return NextResponse.json(UNIT_NAMES);
  } catch (error) {
    return handleApiError(error);
  }
}
