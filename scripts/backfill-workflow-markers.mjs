/**
 * One-off backfill for the participant-entered registration workflow.
 *
 * The new flow adds three markers to User — `unitInfoCompletedAt`,
 * `flightsSubmittedAt` and `submittedForApprovalAt`. Rows that predate them are
 * NULL, which would knock every live team back to "unit information due" even
 * though their unit is already on file, and would show already-approved
 * registrations as approved-but-missing-steps.
 *
 * Safe to re-run: every write is guarded on the target column still being NULL.
 *
 *   node scripts/backfill-workflow-markers.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const participants = await prisma.user.findMany({
    where: { role: "user" },
    select: {
      id: true,
      approved: true,
      applicationStatus: true,
      approvedAt: true,
      updatedAt: true,
      unitInfoCompletedAt: true,
      teamRegisteredAt: true,
      rosterCompletedAt: true,
      flightsSubmittedAt: true,
      submittedForApprovalAt: true,
      flightsFinalizedAt: true,
      unit: { select: { createdAt: true } },
    },
  });

  let unitFilled = 0;
  let flightsFilled = 0;
  let approvedFilled = 0;

  for (const u of participants) {
    const data = {};

    // Unit already supplied under the old flow → that step starts complete.
    if (!u.unitInfoCompletedAt && u.unit) {
      data.unitInfoCompletedAt = u.unit.createdAt;
      unitFilled += 1;
    }

    // Flights the administration already finalized were, by definition, submitted.
    if (!u.flightsSubmittedAt && u.flightsFinalizedAt) {
      data.flightsSubmittedAt = u.flightsFinalizedAt;
      data.submittedForApprovalAt =
        u.submittedForApprovalAt ?? u.flightsFinalizedAt;
      flightsFilled += 1;
    }

    // An SD-approved registration is complete by definition.
    const isApproved = u.approved || u.applicationStatus === "APPROVED";
    if (isApproved) {
      const stamp = u.approvedAt ?? u.updatedAt;
      let touched = false;
      if (!u.teamRegisteredAt) {
        data.teamRegisteredAt = stamp;
        touched = true;
      }
      if (!u.rosterCompletedAt) {
        data.rosterCompletedAt = stamp;
        touched = true;
      }
      if (!u.flightsSubmittedAt && !data.flightsSubmittedAt) {
        data.flightsSubmittedAt = stamp;
        data.submittedForApprovalAt = u.submittedForApprovalAt ?? stamp;
        touched = true;
      }
      if (touched) approvedFilled += 1;
    }

    if (Object.keys(data).length > 0) {
      await prisma.user.update({ where: { id: u.id }, data });
    }
  }

  console.log(`participants scanned:      ${participants.length}`);
  console.log(`unit info marked complete: ${unitFilled}`);
  console.log(`flight submissions filled: ${flightsFilled}`);
  console.log(`approved rows completed:   ${approvedFilled}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
