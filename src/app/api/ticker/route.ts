import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { getPublicTickerItems } from "@/lib/ticker-data";
import { getTickerScrollDurationSec } from "@/lib/ticker-settings";
import {
  resolveTickerVisibilityContext,
  TICKER_VISIBILITY,
  type TickerVisibilityContext,
} from "@/lib/ticker";

function parseContext(value: string | null): TickerVisibilityContext | null {
  if (!value) return null;
  const allowed = [
    TICKER_VISIBILITY.HOMEPAGE,
    TICKER_VISIBILITY.LOGIN,
    TICKER_VISIBILITY.DASHBOARD_BANNER,
  ] as const;
  if ((allowed as readonly string[]).includes(value)) {
    return value as TickerVisibilityContext;
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contextParam = parseContext(searchParams.get("context"));
    const pathname = searchParams.get("pathname") ?? "/";
    const dayTheme = searchParams.get("dayTheme") === "true";

    const context =
      contextParam ?? resolveTickerVisibilityContext(pathname, dayTheme);

    const [items, scrollDurationSec] = await Promise.all([
      getPublicTickerItems(context),
      getTickerScrollDurationSec(),
    ]);

    return NextResponse.json({ items, scrollDurationSec });
  } catch (error) {
    return handleApiError(error);
  }
}
