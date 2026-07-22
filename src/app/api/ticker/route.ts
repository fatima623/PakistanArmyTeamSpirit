import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { getPublicTickerItems } from "@/lib/ticker-data";
import { getTickerScrollDurationSec } from "@/lib/ticker-settings";

export async function GET() {
  try {
    const [items, scrollDurationSec] = await Promise.all([
      getPublicTickerItems(),
      getTickerScrollDurationSec(),
    ]);

    return NextResponse.json({ items, scrollDurationSec });
  } catch (error) {
    return handleApiError(error);
  }
}
