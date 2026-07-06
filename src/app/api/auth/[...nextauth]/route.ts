import type { NextRequest } from "next/server";

import { handlers } from "@/lib/auth";
import { API_ERROR_CODE } from "@/lib/compliance/constants";
import { apiError } from "@/lib/compliance/api-response";
import { checkAuthRateLimit, getClientIp } from "@/lib/compliance/rate-limit";

type AuthHandler = (req: NextRequest) => Promise<Response>;

function shouldRateLimitAuthRequest(req: NextRequest): boolean {
  return req.method === "POST" && req.nextUrl.pathname.endsWith("/callback/credentials");
}

function withAuthRateLimit(handler: AuthHandler): AuthHandler {
  return async (req) => {
    if (!shouldRateLimitAuthRequest(req)) {
      return handler(req);
    }
    const { allowed, retryAfterSec } = checkAuthRateLimit(getClientIp(req));
    if (!allowed) {
      const res = apiError(
        "Too many authentication attempts. Try again later.",
        API_ERROR_CODE.RATE_LIMITED,
        429
      );
      if (retryAfterSec) {
        res.headers.set("Retry-After", String(retryAfterSec));
      }
      return res;
    }
    return handler(req);
  };
}

export const GET = withAuthRateLimit(handlers.GET);
export const POST = withAuthRateLimit(handlers.POST);
