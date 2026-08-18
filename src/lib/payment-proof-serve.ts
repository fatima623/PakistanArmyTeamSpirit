import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/auth-routes";
import {
  hasInternalProof,
  hasLegacyPublicProof,
  readLegacyPublicProof,
  readPaymentProofFromDisk,
  type PaymentProofFilePayload,
} from "@/lib/storage/payment-proof";

export async function loadPaymentProofForPayment(
  paymentId: string,
  requester: { userId: string; role: string }
): Promise<PaymentProofFilePayload> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      userId: true,
      // Explicit select overrides the global `omit` that keeps this LONGBLOB
      // out of ordinary payment queries.
      proofData: true,
      internalFilePath: true,
      proofFileName: true,
      proofMimeType: true,
      proofOriginalFileName: true,
    },
  });

  if (!payment) {
    throw new Error("NOT_FOUND");
  }

  const isOwner = payment.userId === requester.userId;
  const isStaff = isStaffRole(requester.role);
  if (!isOwner && !isStaff) {
    throw new Error("FORBIDDEN");
  }

  // DB blob first: it is the only copy that survives a serverless deploy. Disk
  // and the legacy public folder remain as fallbacks for pre-blob rows.
  let payload: PaymentProofFilePayload | null = payment.proofData
    ? {
        buffer: Buffer.from(payment.proofData),
        mimeType: payment.proofMimeType ?? "application/octet-stream",
        fileName:
          payment.proofOriginalFileName ??
          payment.internalFilePath?.split("/").pop() ??
          "payment-proof",
      }
    : null;

  if (!payload && hasInternalProof(payment) && payment.internalFilePath) {
    payload = await readPaymentProofFromDisk(payment.internalFilePath);
  }
  if (!payload && hasLegacyPublicProof(payment) && payment.proofFileName) {
    payload = await readLegacyPublicProof(payment.proofFileName);
  }
  if (!payload) {
    throw new Error("NO_PROOF");
  }

  if (payment.proofMimeType) {
    payload.mimeType = payment.proofMimeType;
  }
  if (payment.proofOriginalFileName) {
    payload.fileName = payment.proofOriginalFileName;
  }

  return payload;
}
