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

/**
 * Same as {@link flightDetailSelect} but without the `teamMember` back-relation
 * — for use when the record is already nested UNDER a TeamMember
 * (`teamMembers: { select: { ..., flightDetail: { select: flightDetailSummarySelect } } }`).
 */
export const flightDetailSummarySelect = {
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
} as const;

/**
 * THE definition of a complete flight record — one traveller with BOTH
 * documents on file. Every surface (participant progress, admin finalize gate,
 * the sidebar badge, the host coverage pills) MUST use this, or they will
 * disagree and a team could be locked with zero documents uploaded.
 *
 * Checks *FilePath (the stored file), not *FileName (a display-only copy).
 */
export function isFlightRecordComplete(
  flight: { passportFilePath: string | null; ticketFilePath: string | null } | null
): boolean {
  return !!flight?.passportFilePath && !!flight?.ticketFilePath;
}

export type FlightCoverage = {
  /** Roster size. */
  teamMemberCount: number;
  /** Members that have a flight record at all. */
  membersWithRecord: number;
  /** Members whose record has BOTH passport and ticket on file. */
  membersComplete: number;
};

/**
 * Live per-member flight coverage. Always counted from the TeamMember side —
 * counting `flightDetail` rows would let a legacy orphan (teamMemberId = null)
 * satisfy the tally for a member who submitted nothing. Never cache this: the
 * roster stays mutable until administration finalizes.
 */
export async function loadFlightCoverage(
  userId: string
): Promise<FlightCoverage> {
  const [teamMemberCount, membersWithRecord, membersComplete] =
    await Promise.all([
      prisma.teamMember.count({ where: { userId } }),
      prisma.teamMember.count({
        where: { userId, flightDetail: { isNot: null } },
      }),
      prisma.teamMember.count({
        where: {
          userId,
          flightDetail: {
            is: {
              passportFilePath: { not: null },
              ticketFilePath: { not: null },
            },
          },
        },
      }),
    ]);

  return { teamMemberCount, membersWithRecord, membersComplete };
}

/** Every roster member has a complete record (and the roster isn't empty). */
export function isTeamFlightsComplete(coverage: FlightCoverage): boolean {
  return (
    coverage.teamMemberCount > 0 &&
    coverage.membersComplete === coverage.teamMemberCount
  );
}

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
