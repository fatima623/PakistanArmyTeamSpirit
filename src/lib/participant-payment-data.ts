import { prisma } from "@/lib/prisma";
import { getPaymentSettings } from "@/lib/payment-settings";
import { canSubmitPayment } from "@/lib/user-status";
import {
  serializeRejectionHistory,
  type PaymentRejectionHistoryEntry,
} from "@/lib/payment-rejection-history";

export type ParticipantPaymentRow = {
  id: string;
  amount: string;
  status: string;
  transactionReference: string | null;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
  proofFileName: string | null;
  internalFilePath?: string | null;
  proofOriginalFileName?: string | null;
  proofMimeType?: string | null;
  proofFileSize?: number | null;
  rejectionReason: string | null;
  rejectionHistory: PaymentRejectionHistoryEntry[];
};

export type ParticipantPaymentData = {
  canSubmit: boolean;
  paymentStatus: string;
  rejectionHistory: PaymentRejectionHistoryEntry[];
  payments: ParticipantPaymentRow[];
  paymentSettings: Awaited<ReturnType<typeof getPaymentSettings>>;
  defaultAmount: number;
};

export async function getParticipantPaymentData(
  userId: string
): Promise<ParticipantPaymentData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      applicationStatus: true,
      paymentStatus: true,
      suspended: true,
    },
  });

  if (!user) return null;

  const [payments, paymentSettings] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        rejectionHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getPaymentSettings(),
  ]);

  const mappedPayments = payments.map((payment) => ({
    id: payment.id,
    amount: payment.amount.toString(),
    status: payment.status,
    transactionReference: payment.transactionReference,
    paymentDate: payment.paymentDate?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    proofFileName: payment.proofFileName,
    internalFilePath: payment.internalFilePath,
    proofOriginalFileName: payment.proofOriginalFileName,
    proofMimeType: payment.proofMimeType,
    proofFileSize: payment.proofFileSize,
    rejectionReason: payment.rejectionReason,
    rejectionHistory: serializeRejectionHistory(payment.rejectionHistory),
  }));

  const latestPayment = mappedPayments[0];

  return {
    canSubmit: canSubmitPayment(
      user.applicationStatus,
      user.paymentStatus,
      user.suspended
    ),
    paymentStatus: user.paymentStatus,
    rejectionHistory: latestPayment?.rejectionHistory ?? [],
    payments: mappedPayments,
    paymentSettings,
    defaultAmount: paymentSettings.registrationFee,
  };
}
