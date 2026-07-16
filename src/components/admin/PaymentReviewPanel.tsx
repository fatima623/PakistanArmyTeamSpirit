"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  CornerUpLeft,
  Image as ImageIcon,
  Info,
  Landmark,
  ShieldCheck,
  Tag,
  Upload,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { formatRegistrationFee } from "@/lib/payment-settings";
import {
  PAYMENT_STATUS,
  isPaymentVerified,
  normalizePaymentStatus,
} from "@/lib/constants";
import type { PaymentRejectionHistoryEntry } from "@/lib/payment-rejection-history";
import { PaymentStatusTimeline } from "@/components/payments/PaymentStatusTimeline";
import { PaymentStatusBadge } from "@/components/admin/StatusBadges";
import { PaymentProofViewer } from "@/components/payments/PaymentProofViewer";
import { PaymentVerificationActions } from "@/components/admin/PaymentActions";
import { cn, formatDateDisplay, formatDateTimePK } from "@/lib/utils";

type Payment = {
  id: string;
  amount: string | number;
  status: string;
  transactionReference: string | null;
  paymentDate: string | null;
  proofFileName: string | null;
  internalFilePath?: string | null;
  proofOriginalFileName?: string | null;
  proofMimeType?: string | null;
  proofFileSize?: number | null;
  proofUploadedAt?: string | null;
  uploaderName?: string | null;
  uploaderEmail?: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt?: string | null;
  verifiedAt?: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    unit: { unitName: string } | null;
  };
};

/** Labelled tile with an optional leading icon (reference: Transaction
 *  Details / Verification Summary cards). */
function Stat({
  label,
  value,
  icon: IconCmp,
  wide = false,
  mono = false,
  children,
}: {
  label: string;
  value?: string;
  icon?: LucideIcon;
  wide?: boolean;
  mono?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-3",
        wide && "col-span-full"
      )}
    >
      {IconCmp ? (
        <span
          className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-gray-200 bg-white text-green-700"
          aria-hidden
        >
          <IconCmp size={15} />
        </span>
      ) : null}
      <div className="flex min-w-0 flex-col gap-[5px]">
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">
          {label}
        </span>
        {children ?? (
          <span
            className={cn(
              "break-words text-[0.9375rem] font-semibold text-slate-900",
              mono && "font-mono text-sm"
            )}
          >
            {value || "—"}
          </span>
        )}
      </div>
    </div>
  );
}

const SECTION =
  "rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden";
const SECTION_HEADER =
  "flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5";
const SECTION_TITLE =
  "flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:text-green-700";

export function PaymentReviewPanel({
  payment,
  rejectionHistory,
  canDecide = true,
}: {
  payment: Payment;
  rejectionHistory: PaymentRejectionHistoryEntry[];
  /** MT (Management Team) only — false renders a read-only panel. */
  canDecide?: boolean;
}) {
  const participantName = `${payment.user.firstName} ${payment.user.lastName}`;
  const persistedStatus = normalizePaymentStatus(payment.status);
  const alreadyVerified = isPaymentVerified(payment.status);
  const hasProof = Boolean(payment.internalFilePath || payment.proofFileName);
  const isProofRejected = persistedStatus === PAYMENT_STATUS.REJECTED;
  const isReturned = persistedStatus === PAYMENT_STATUS.RETURNED;
  const amountLabel = formatRegistrationFee(payment.amount);

  const verificationResult = alreadyVerified
    ? "Verified"
    : isProofRejected
      ? "Rejected"
      : isReturned
        ? "Returned"
        : "Pending review";

  const lastUpdated = formatDateTimePK(
    payment.verifiedAt ??
      payment.updatedAt ??
      payment.proofUploadedAt ??
      payment.createdAt
  );

 
    
  

  return (
    <>
      {/* —— Transaction Details ————————————————————————————— */}
      <section className={SECTION}>
        <div className={SECTION_HEADER}>
          <h3 className={SECTION_TITLE}>
            <Landmark className="h-4 w-4" aria-hidden />
            Transaction Details
          </h3>
        </div>
        <div className="p-[18px]">
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
            <Stat label="Amount" value={amountLabel} icon={CircleDollarSign} />
            <Stat
              label="Payment Date"
              value={
                payment.paymentDate
                  ? formatDateDisplay(payment.paymentDate)
                  : "—"
              }
              icon={CalendarDays}
            />
            <Stat
              label="Submitted On"
              value={formatDateTimePK(payment.createdAt)}
              icon={Upload}
            />
            <Stat
              label="Reference"
              value={payment.transactionReference ?? "—"}
              icon={Tag}
              mono
            />
          </div>
        </div>
      </section>

      {/* —— Payment Proof ———————————————————————————————————— */}
      {hasProof ? (
        <section className={SECTION}>
          <div className={SECTION_HEADER}>
            <h3 className={SECTION_TITLE}>
              <ImageIcon className="h-4 w-4" aria-hidden />
              Payment Proof
            </h3>
          </div>
          <div className="p-[18px]">
            <PaymentProofViewer
              paymentId={payment.id}
              access="admin"
              mimeType={payment.proofMimeType}
              fileName={
                payment.proofOriginalFileName ??
                payment.proofFileName ??
                undefined
              }
              withToolbar
              imageMaxHeight="h-80"
            />
          </div>
        </section>
      ) : null}

      {/* —— Verification Summary ————————————————————————————— */}
      <section className={SECTION}>
        <div className={SECTION_HEADER}>
          <h3 className={SECTION_TITLE}>
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Verification Summary
          </h3>
        </div>
        <div className="space-y-4 p-[18px]">
       

          {(isProofRejected || isReturned) && payment.rejectionReason ? (
            <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[0.8125rem] leading-[1.5] text-amber-900">
              <span className="font-bold">Message sent to participant:</span>{" "}
              {payment.rejectionReason}
            </p>
          ) : null}

          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            <Stat label="Payment Status">
              <span>
                <PaymentStatusBadge
                  status={payment.status}
                  showPrefix={false}
                  density="table"
                />
              </span>
            </Stat>
            <Stat label="Amount Due" value={amountLabel} />
            <Stat label="Verification Result" value={verificationResult} />
            <Stat label="Last Updated" value={lastUpdated} />
          </div>

          <PaymentStatusTimeline
            status={payment.status}
            history={rejectionHistory}
          />

          {canDecide ? (
            <div className="border-t border-gray-200 pt-4">
              <PaymentVerificationActions
                paymentId={payment.id}
                status={payment.status}
                participantName={participantName}
                amountLabel={amountLabel}
              />
            </div>
          ) : (
            <p className="m-0 inline-flex items-center gap-1.5 text-[0.78rem] text-slate-500 [&_svg]:text-slate-400">
              <Info className="h-3.5 w-3.5" aria-hidden />
              View-only — payment decisions are made by the MT (Management
              Team).
            </p>
          )}
        </div>
      </section>
    </>
  );
}
