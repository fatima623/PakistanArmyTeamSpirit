import { prisma } from "@/lib/prisma";
import {
  hasInternalProof,
  hasLegacyPublicProof,
  readLegacyPublicProof,
  readPaymentProofByInternalPath,
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
  const isAdmin = requester.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new Error("FORBIDDEN");
  }

  let payload: PaymentProofFilePayload;

  if (hasInternalProof(payment) && payment.internalFilePath) {
    payload = await readPaymentProofByInternalPath(payment.internalFilePath);
  } else if (hasLegacyPublicProof(payment) && payment.proofFileName) {
    payload = await readLegacyPublicProof(payment.proofFileName);
  } else {
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
