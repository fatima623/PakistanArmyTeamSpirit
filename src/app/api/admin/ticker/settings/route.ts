import { NextResponse } from "next/server";

import {
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { revalidateTickerPaths } from "@/lib/revalidate-public";
import {
  getTickerScrollSpeed,
  setTickerScrollSpeed,
} from "@/lib/ticker-settings";
import {
  TICKER_SCROLL_DURATION_SEC,
  TICKER_SCROLL_SPEED_LABELS,
  tickerScrollDurationSec,
} from "@/lib/ticker";
import { TickerScrollSpeedSchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireAdmin();
    const speed = await getTickerScrollSpeed();
    return NextResponse.json({
      scrollSpeed: speed,
      scrollDurationSec: tickerScrollDurationSec(speed),
      labels: TICKER_SCROLL_SPEED_LABELS,
      durations: TICKER_SCROLL_DURATION_SEC,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = TickerScrollSpeedSchema.safeParse(body.scrollSpeed);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: { scrollSpeed: ["Invalid scroll speed"] } },
        { status: 400 }
      );
    }

    const speed = await setTickerScrollSpeed(parsed.data);
    revalidateTickerPaths();

    return NextResponse.json({
      scrollSpeed: speed,
      scrollDurationSec: tickerScrollDurationSec(speed),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
