import { auth } from "@/lib/auth";
import { canAccessAdminArea, getRoleHomePath } from "@/lib/auth-routes";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function forwardWithPathname(req: NextRequest, requestId: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("X-Request-ID", requestId);
  return response;
}

function redirectTo(url: URL, requestId: string) {
  const response = NextResponse.redirect(url);
  response.headers.set("X-Request-ID", requestId);
  return response;
}

function buildLoginRedirect(origin: string, requestId: string, req: NextRequest) {
  const loginUrl = new URL("/event/login", origin);
  const requestedPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  loginUrl.searchParams.set("next", requestedPath);
  return redirectTo(loginUrl, requestId);
}

function isPublicFastPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/key-dates")) return true;
  if (pathname.startsWith("/privacy")) return true;
  if (pathname.startsWith("/news/")) return true;
  if (pathname.startsWith("/page/")) return true;
  if (pathname === "/manifest.webmanifest") return true;
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const requestId = crypto.randomUUID();
  const origin = req.nextUrl.origin;

  if (isPublicFastPath(pathname)) {
    return forwardWithPathname(req, requestId);
  }

  const session = req.auth;
  const isLoggedIn = !!session;
  const role = session?.user?.role;
  const sessionExpiresAt = session?.sessionExpiresAt;
  const sessionExpired =
    typeof sessionExpiresAt === "string" &&
    new Date(sessionExpiresAt).getTime() <= Date.now();

  const isParticipantArea =
    pathname.startsWith("/event/dashboard") ||
    pathname.startsWith("/event/edit") ||
    pathname.startsWith("/event/payment") ||
    pathname.startsWith("/event/tickets") ||
    pathname.startsWith("/event/timeline") ||
    pathname.startsWith("/event/team");
  const isAdmin = pathname.startsWith("/admin");
  const isRegisterPage = pathname === "/event/register";

  if (isParticipantArea) {
    if (!isLoggedIn || sessionExpired) {
      return buildLoginRedirect(origin, requestId, req);
    }
    if (canAccessAdminArea(role)) {
      return redirectTo(new URL("/admin", origin), requestId);
    }
  }

  if (isAdmin) {
    if (!isLoggedIn || sessionExpired) {
      return buildLoginRedirect(origin, requestId, req);
    }
    if (!canAccessAdminArea(role)) {
      return redirectTo(new URL("/event/dashboard", origin), requestId);
    }
  }

  /* Logged-in users may open /event/login (sign out / switch account). */
  if (isLoggedIn && !sessionExpired && isRegisterPage) {
    return redirectTo(new URL(getRoleHomePath(role), origin), requestId);
  }

  return forwardWithPathname(req, requestId);
});

export const config = {
  matcher: [
    "/",
    "/key-dates/:path*",
    "/privacy",
    "/news/:path*",
    "/page/:path*",
    "/manifest.webmanifest",
    "/admin/:path*",
    "/event/dashboard/:path*",
    "/event/edit/:path*",
    "/event/payment/:path*",
    "/event/tickets/:path*",
    "/event/timeline/:path*",
    "/event/team/:path*",
    "/event/login",
    "/event/register",
    "/event/forgot-password",
    "/event/reset-password/:path*",
    "/api/:path*",
  ],
};
