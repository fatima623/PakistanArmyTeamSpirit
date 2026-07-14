import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  canAccessAdminArea,
  canAccessHostArea,
  canApproveRegistration,
  canVerifyPayment,
} from "@/lib/auth-routes";

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    throw new ApiError("Forbidden", 403);
  }
  return session;
}

/** Any back-office team member: admin, MTD, or SDBS. */
export async function requireStaff() {
  const session = await requireAuth();
  if (!canAccessAdminArea(session.user.role)) {
    throw new ApiError("Forbidden", 403);
  }
  return session;
}

/** Host Formation login only — read-only host dashboard data endpoints. */
export async function requireHost() {
  const session = await requireAuth();
  if (!canAccessHostArea(session.user.role)) {
    throw new ApiError("Forbidden", 403);
  }
  return session;
}

/** SD (Sports Directorate) only — registration verification decisions. */
export async function requireRegistrationApprover() {
  const session = await requireAuth();
  if (!canApproveRegistration(session.user.role)) {
    throw new ApiError(
      "Registration verification is performed by the SD (Sports Directorate) only",
      403
    );
  }
  return session;
}

/** MT (Management Team) only — payment verification decisions. */
export async function requirePaymentVerifier() {
  const session = await requireAuth();
  if (!canVerifyPayment(session.user.role)) {
    throw new ApiError(
      "Payment verification is performed by the MT (Management Team) only",
      403
    );
  }
  return session;
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export function requireJsonContentType(request: Request) {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new ApiError("Content-Type must be application/json", 415);
  }
}

export const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  rank: true,
  gender: true,
  country: true,
  nationality: true,
  role: true,
  approved: true,
  applicationStatus: true,
  paymentStatus: true,
  adminNotes: true,
  rejectionReason: true,
  rejectedAt: true,
  approvedAt: true,
  suspended: true,
  privacyAccepted: true,
  privacyAcceptedAt: true,
  participationConfirmedAt: true,
  participationDeclinedAt: true,
  teamRegisteredAt: true,
  rosterCompletedAt: true,
  maxTeamMembersOverride: true,
  flightsFinalizedAt: true,
  hostFormationId: true,
  finalizedForHostAt: true,
  createdAt: true,
  updatedAt: true,
} as const;
