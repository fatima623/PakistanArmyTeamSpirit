/**
 * Pure-logic checks for admin payment status transitions.
 * Run: npx tsx scripts/test-payment-status-transitions.ts
 */
import assert from "node:assert/strict";
import { PAYMENT_STATUS } from "../src/lib/constants";
import {
  buildPaymentStatusUpdateData,
  requiresPaymentRejectionReasonForUpdate,
  resolvePaymentRejectionReason,
} from "../src/lib/payment-status-update";

const ALL_STATUSES = [
  PAYMENT_STATUS.PENDING,
  PAYMENT_STATUS.SUBMITTED,
  PAYMENT_STATUS.UNDER_REVIEW,
  PAYMENT_STATUS.VERIFIED,
  PAYMENT_STATUS.REJECTED,
  PAYMENT_STATUS.RETURNED,
] as const;

function baseExisting(status: string) {
  return {
    status,
    adminNotes: "note",
    rejectionReason: "Previous rejection reason",
  };
}

console.log("Testing rejection reason resolution…");

assert.equal(
  resolvePaymentRejectionReason({
    nextStatus: PAYMENT_STATUS.SUBMITTED,
    existingStatus: PAYMENT_STATUS.REJECTED,
    existingReason: "Bad proof",
    incomingReason: undefined,
    statusChanged: true,
  }),
  "Bad proof",
  "REJECTED → SUBMITTED preserves reason"
);

assert.equal(
  resolvePaymentRejectionReason({
    nextStatus: PAYMENT_STATUS.UNDER_REVIEW,
    existingStatus: PAYMENT_STATUS.RETURNED,
    existingReason: "Fix amount",
    incomingReason: undefined,
    statusChanged: true,
  }),
  "Fix amount",
  "RETURNED → UNDER_REVIEW preserves reason"
);

assert.equal(
  resolvePaymentRejectionReason({
    nextStatus: PAYMENT_STATUS.REJECTED,
    existingStatus: PAYMENT_STATUS.REJECTED,
    existingReason: "Bad proof",
    incomingReason: undefined,
    statusChanged: false,
  }),
  "Bad proof",
  "Notes-only save on REJECTED keeps reason"
);

assert.equal(
  resolvePaymentRejectionReason({
    nextStatus: PAYMENT_STATUS.REJECTED,
    existingStatus: PAYMENT_STATUS.SUBMITTED,
    existingReason: null,
    incomingReason: "New reason",
    statusChanged: true,
  }),
  "New reason",
  "SUBMITTED → REJECTED stores reason"
);

console.log("Testing requiresPaymentRejectionReasonForUpdate…");

assert.equal(
  requiresPaymentRejectionReasonForUpdate(
    PAYMENT_STATUS.REJECTED,
    PAYMENT_STATUS.REJECTED,
    false
  ),
  false,
  "No reason required for notes-only on REJECTED"
);

assert.equal(
  requiresPaymentRejectionReasonForUpdate(
    PAYMENT_STATUS.UNDER_REVIEW,
    PAYMENT_STATUS.REJECTED,
    true
  ),
  false,
  "No reason required when leaving REJECTED"
);

assert.equal(
  requiresPaymentRejectionReasonForUpdate(
    PAYMENT_STATUS.REJECTED,
    PAYMENT_STATUS.SUBMITTED,
    true
  ),
  true,
  "Reason required when moving to REJECTED"
);

console.log("Testing all status transition data builds…");

for (const from of ALL_STATUSES) {
  for (const to of ALL_STATUSES) {
    const existing = baseExisting(from);
    const needsReason = requiresPaymentRejectionReasonForUpdate(
      to,
      from,
      from !== to
    );
    const incomingReason = needsReason ? "Transition reason" : undefined;

    const { data, statusChanged } = buildPaymentStatusUpdateData({
      existing,
      status: to,
      adminNotes: "updated notes",
      rejectionReason: incomingReason,
      verifiedById: "admin-1",
    });

    assert.equal(data.status, to, `${from} → ${to}: status`);
    assert.equal(statusChanged, from !== to, `${from} → ${to}: statusChanged`);

    if (to === PAYMENT_STATUS.VERIFIED) {
      assert.ok(data.verifiedById, `${from} → VERIFIED sets verifier`);
      assert.ok(data.verifiedAt, `${from} → VERIFIED sets verifiedAt`);
    } else {
      assert.equal(data.verifiedById, null, `${from} → ${to}: clears verifier`);
      assert.equal(data.verifiedAt, null, `${from} → ${to}: clears verifiedAt`);
    }

    if (
      from !== to &&
      (from === PAYMENT_STATUS.REJECTED || from === PAYMENT_STATUS.RETURNED) &&
      to !== PAYMENT_STATUS.REJECTED &&
      to !== PAYMENT_STATUS.RETURNED
    ) {
      assert.equal(
        data.rejectionReason,
        "Previous rejection reason",
        `${from} → ${to}: preserves rejection reason`
      );
    }
  }
}

console.log(`All ${ALL_STATUSES.length ** 2} transition combinations passed.`);
