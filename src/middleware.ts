import { auth } from "@/lib/auth-edge";
import { pathnameIsTourPage } from "@/lib/tour-navigation";
import {
  canAccessAdminArea,
  canAccessHostArea,
  getRoleHomePath,
  isHostRole,
} from "@/lib/auth-routes";
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

/* The public website is only the home page, the login flow and the privacy
   policy. Everything else that used to be public is now the portal's Tour. */
function isPublicFastPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/privacy")) return true;
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
    pathname.startsWith("/event/tickets") ||
    pathname.startsWith("/event/team") ||
    pathname.startsWith("/event/flights") ||
    pathname.startsWith("/event/journey") ||
    pathname.startsWith("/event/host-info") ||
    pathname.startsWith("/event/confirm-participation");
  const isTour = pathnameIsTourPage(pathname);
  const isAdmin = pathname.startsWith("/admin");
  const isHostArea = pathname.startsWith("/host");
  const isRegisterPage = pathname === "/event/register";

  if (isParticipantArea) {
    if (!isLoggedIn || sessionExpired) {
      return buildLoginRedirect(origin, requestId, req);
    }
    if (canAccessAdminArea(role)) {
      return redirectTo(new URL("/admin", origin), requestId);
    }
    // Host Formation logins are confined to their read-only /host area.
    if (isHostRole(role)) {
      return redirectTo(new URL("/host", origin), requestId);
    }
  }

  /* Tour pages are open to any signed-in role — participants browse them from
     the sidebar, staff from the admin console. */
  if (isTour) {
    if (!isLoggedIn || sessionExpired) {
      return buildLoginRedirect(origin, requestId, req);
    }
  }

  if (isAdmin) {
    if (!isLoggedIn || sessionExpired) {
      return buildLoginRedirect(origin, requestId, req);
    }
    if (!canAccessAdminArea(role)) {
      return redirectTo(new URL(getRoleHomePath(role), origin), requestId);
    }
  }

  if (isHostArea) {
    if (!isLoggedIn || sessionExpired) {
      return buildLoginRedirect(origin, requestId, req);
    }
    if (!canAccessHostArea(role)) {
      return redirectTo(new URL(getRoleHomePath(role), origin), requestId);
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
    "/privacy",
    "/manifest.webmanifest",
    /* Tour (login-gated former marketing site) */
    "/tour/:path*",
    "/events-detail/:path*",
    "/international/:path*",
    "/familiarization/:path*",
    "/awards/:path*",
    "/gallery/:path*",
    "/announcements/:path*",
    "/key-dates/:path*",
    "/news/:path*",
    "/documents/:path*",
    "/operations/:path*",
    "/exercise-contour/:path*",
    "/page/:path*",
    "/admin/:path*",
    "/host/:path*",
    "/event/dashboard/:path*",
    "/event/edit/:path*",
    "/event/tickets/:path*",
    "/event/team/:path*",
    "/event/flights/:path*",
    "/event/journey/:path*",
    "/event/host-info/:path*",
    "/event/confirm-participation/:path*",
    "/event/login",
    "/event/register",
    "/event/forgot-password",
    "/event/reset-password/:path*",
    "/api/:path*",
  ],
};
