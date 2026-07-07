import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-helpers";
import {
  areFlightsFinalized,
  canEditFlights,
  isFlightDeadlinePassed,
  isRosterComplete,
  workflowUserSelect,
  type WorkflowSettings,
  type WorkflowUser,
} from "@/lib/participant-workflow";
import { getWorkflowSettings } from "@/lib/workflow-settings";

/** Client-safe flight record (files exposed via authorized endpoints only). */
export const flightDetailSelect = {
  id: true,
  teamMemberId: true,
  passengerName: true,
  passportNumber: true,
  passportFileName: true,
  passportFileSize: true,
  passportUploadedAt: true,
  ticketFileName: true,
  ticketFileSize: true,
  ticketUploadedAt: true,
  updatedAt: true,
  teamMember: {
    select: { id: true, fullName: true, rank: true, serviceNumber: true },
  },
} as const;

export type FlightGuardContext = {
  user: WorkflowUser;
  settings: WorkflowSettings;
};

export async function loadFlightContext(
  userId: string
): Promise<FlightGuardContext> {
  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: workflowUserSelect,
    }),
    getWorkflowSettings(),
  ]);
  if (!user) throw new ApiError("User not found", 404);
  return { user, settings };
}

/**
 * Guard for flight-detail mutations: roster must be complete, records must
 * not be finalized by administration, and the deadline must not have passed.
 */
export async function requireEditableFlights(
  userId: string
): Promise<FlightGuardContext> {
  const ctx = await loadFlightContext(userId);
  if (!isRosterComplete(ctx.user)) {
    throw new ApiError(
      "Complete your team member roster first — flight details unlock afterwards",
      409
    );
  }
  if (areFlightsFinalized(ctx.user)) {
    throw new ApiError(
      "Flight details have been finalized by the administration and are locked",
      409
    );
  }
  if (isFlightDeadlinePassed(ctx.settings)) {
    throw new ApiError(
      "The flight details submission deadline has passed",
      409
    );
  }
  if (!canEditFlights(ctx.user, ctx.settings)) {
    throw new ApiError("Flight details are not editable right now", 409);
  }
  return ctx;
}
