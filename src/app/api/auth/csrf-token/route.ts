import { NextResponse } from "next/server";

import { getOrCreateAuthCsrfToken } from "@/lib/auth-csrf";
import { checkRateLimit, getClientIp } from "@/lib/compliance/rate-limit";

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(getClientIp(request), "auth-csrf", 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many CSRF token requests." },
      {
        status: 429,
        headers: rateLimit.retryAfterSec
          ? { "Retry-After": String(rateLimit.retryAfterSec) }
          : undefined,
      }
    );
  }

  const token = await getOrCreateAuthCsrfToken();
  return NextResponse.json({ csrfToken: token });
}
