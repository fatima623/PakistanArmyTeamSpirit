"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Image as ImageIcon,
  Info,
  Loader2,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRegistrationFee } from "@/lib/payment-settings";
import { TOAST } from "@/lib/toast";
import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  isPaymentVerified,
  normalizePaymentStatus,
  type PaymentStatus,
} from "@/lib/constants";
import {
  PAYMENT_DETAIL_DROPDOWN_OPTIONS,
  dropdownStatusValue,
  paymentDetailStatusHint,
} from "@/lib/payment-workflow";
import { requiresPaymentRejectionReason } from "@/components/payments/PaymentRejectionReasonBox";
import { PaymentStatusTimeline } from "@/components/payments/PaymentStatusTimeline";
import type { PaymentRejectionHistoryEntry } from "@/lib/payment-rejection-history";
import "@/app/payment-status-timeline.css";
import { PaymentStatusBadge } from "@/components/admin/StatusBadges";
import { PaymentProofViewer } from "@/components/payments/PaymentProofViewer";
import { formatDateDisplay, formatDateShort, cn } from "@/lib/utils";

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
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    unit: { unitName: string } | null;
  };
};

function Stat({
  label,
  value,
  wide = false,
  mono = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-[5px] rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-3 transition-colors hover:border-slate-300 hover:bg-white hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]", wide && "col-span-full")}>
      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">{label}</span>
      <span
        className={cn(
          "break-words text-[0.9375rem] font-semibold text-slate-900",
          mono && "font-mono text-sm"
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

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
  const router = useRouter();
  const participantName = `${payment.user.firstName} ${payment.user.lastName}`;
  const persistedStatus = normalizePaymentStatus(payment.status);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>(() =>
    dropdownStatusValue(persistedStatus)
  );
  const [loading, setLoading] = useState(false);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [pendingReasonStatus, setPendingReasonStatus] =
    useState<PaymentStatus | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const alreadyVerified = isPaymentVerified(payment.status);
  const statusControlsLocked = alreadyVerified || !canDecide;
  const hasProof = Boolean(payment.internalFilePath || payment.proofFileName);
  const statusDirty = selectedStatus !== persistedStatus;
  const isProofRejected = persistedStatus === PAYMENT_STATUS.REJECTED;
  const isReturned = persistedStatus === PAYMENT_STATUS.RETURNED;
  const statusHint = paymentDetailStatusHint(payment.status);

  useEffect(() => {
    setSelectedStatus(
      dropdownStatusValue(normalizePaymentStatus(payment.status))
    );
  }, [payment.id, payment.status, payment.rejectionReason]);

  const save = async (
    nextStatus: string,
    options?: { rejectionReason?: string }
  ) => {
    setLoading(true);
    const normalized = normalizePaymentStatus(nextStatus);
    const payload: {
      status: PaymentStatus;
      rejectionReason?: string;
    } = {
      status: normalized,
    };
    if (options?.rejectionReason?.trim()) {
      payload.rejectionReason = options.rejectionReason.trim();
    }

    const res = await fetch(`/api/admin/payments/${payment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSelectedStatus(normalized);
      setReasonDialogOpen(false);
      setPendingReasonStatus(null);
      setRejectReason("");
      toast.success(
        isPaymentVerified(normalized)
          ? TOAST.PAYMENT_VERIFY_SUCCESS
          : normalized === PAYMENT_STATUS.REJECTED
            ? "Payment marked as rejected"
            : normalized === PAYMENT_STATUS.RETURNED
              ? "Payment returned for correction"
              : TOAST.SAVE_SUCCESS
      );
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      const reasonError = (
        body as { errors?: { rejectionReason?: string[] } }
      ).errors?.rejectionReason?.[0];
      toast.error(reasonError ?? (body as { error?: string }).error ?? TOAST.GENERIC_ERROR);
    }
    setLoading(false);
  };

  const openReasonDialog = (status: PaymentStatus) => {
    setPendingReasonStatus(status);
    setRejectReason("");
    setReasonDialogOpen(true);
  };

  const handleApplyStatus = () => {
    if (requiresPaymentRejectionReason(selectedStatus)) {
      openReasonDialog(selectedStatus);
      return;
    }
    void save(selectedStatus);
  };

  const handleConfirmReason = async () => {
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      toast.error("Enter a reason the participant will see on their portal");
      return;
    }
    if (!pendingReasonStatus) return;
    await save(pendingReasonStatus, { rejectionReason: trimmed });
  };

  const reasonDialogTitle =
    pendingReasonStatus === PAYMENT_STATUS.RETURNED
      ? "Return payment for correction?"
      : "Reject payment proof?";

  const reasonDialogDescription =
    pendingReasonStatus === PAYMENT_STATUS.RETURNED
      ? `You are returning ${participantName}'s payment proof for correction. Explain what the participant must fix before resubmitting.`
      : `You are rejecting ${participantName}'s payment proof. Explain what is wrong so they can correct it on their portal.`;

  const reasonConfirmLabel =
    pendingReasonStatus === PAYMENT_STATUS.RETURNED
      ? "Return and notify participant"
      : "Reject and notify participant";

  const verificationResult = alreadyVerified
    ? "Verified"
    : isProofRejected
      ? "Rejected"
      : isReturned
        ? "Returned"
        : "Pending review";
  const lastUpdated = formatDateShort(
    payment.proofUploadedAt ?? payment.createdAt
  );

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden transition-[box-shadow,transform] duration-200">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
          <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:text-green-700">
            <Receipt className="h-4 w-4" aria-hidden />
            Transaction details
          </h3>
        </div>
        <div className="p-[18px]">
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
            <Stat
              label="Amount"
              value={formatRegistrationFee(payment.amount)}
            />
            <Stat
              label="Submitted"
              value={formatDateShort(payment.createdAt)}
            />
            <Stat
              label="Payment date"
              value={
                payment.paymentDate
                  ? formatDateDisplay(payment.paymentDate)
                  : "—"
              }
            />
            <Stat
              label="Reference"
              value={payment.transactionReference ?? "—"}
              mono
              wide
            />
            {payment.uploaderName ? (
              <Stat
                label="Uploaded by"
                value={
                  payment.uploaderEmail
                    ? `${payment.uploaderName} · ${payment.uploaderEmail}`
                    : payment.uploaderName
                }
                wide
              />
            ) : null}
            {payment.proofUploadedAt ? (
              <Stat
                label="Upload date"
                value={formatDateShort(payment.proofUploadedAt)}
              />
            ) : null}
            {payment.proofFileSize != null ? (
              <Stat
                label="File size"
                value={`${(payment.proofFileSize / 1024).toFixed(1)} KB`}
              />
            ) : null}
            {payment.proofOriginalFileName ? (
              <Stat
                label="Filename"
                value={payment.proofOriginalFileName}
                wide
              />
            ) : null}
          </div>
        </div>
      </section>

      {hasProof ? (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden transition-[box-shadow,transform] duration-200">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
            <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:text-green-700">
              <ImageIcon className="h-4 w-4" aria-hidden />
              Payment proof
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
              imageMaxHeight="max-h-[30rem]"
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden transition-[box-shadow,transform] duration-200">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
          <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:text-green-700">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Verification
          </h3>
          <PaymentStatusBadge status={payment.status} showPrefix={false} />
        </div>
        <div className="space-y-4 p-[18px]">
          {alreadyVerified ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-3.5 py-3 text-sm leading-[1.45] text-green-900 [&_svg]:mt-px [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              <span>
                Payment verified successfully. No further action is required.
              </span>
            </div>
          ) : null}

          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            <div className="flex flex-col gap-[5px] rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-3 transition-colors hover:border-slate-300 hover:bg-white hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">Payment status</span>
              <span>
                <PaymentStatusBadge
                  status={payment.status}
                  showPrefix={false}
                  density="table"
                />
              </span>
            </div>
            <Stat
              label="Amount due"
              value={formatRegistrationFee(payment.amount)}
            />
            <Stat label="Verification result" value={verificationResult} />
            <Stat label="Last updated" value={lastUpdated} />
          </div>

          {statusHint ? (
            <p className="mt-[0.85rem] rounded-lg border border-sky-200 bg-sky-50 px-[0.9rem] py-[0.7rem] text-[0.8rem] leading-[1.4] text-sky-900">{statusHint}</p>
          ) : null}

          <PaymentStatusTimeline
            status={payment.status}
            history={rejectionHistory}
          />

          <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600" htmlFor="payment-status">
              Update status
            </label>
            <div
              className={cn(
                statusControlsLocked &&
                  "pointer-events-none cursor-not-allowed opacity-50"
              )}
              title={
                !canDecide
                  ? "Only the Management Team (MT) can change payment decisions."
                  : undefined
              }
            >
              <Select
                value={selectedStatus}
                disabled={statusControlsLocked || loading}
                onValueChange={(v) =>
                  setSelectedStatus(normalizePaymentStatus(v))
                }
              >
                <SelectTrigger id="payment-status" className="admin-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_DETAIL_DROPDOWN_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PAYMENT_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {statusControlsLocked ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[0.78rem] text-slate-500 [&_svg]:text-slate-400">
                <Info className="h-3.5 w-3.5" aria-hidden />
                {!canDecide
                  ? "View-only — payment decisions are made by the MT (Management Team)."
                  : "Payment has been verified. Reject proof to make changes."}
              </p>
            ) : null}
          </div>

          {canDecide ? (
            <div className="flex flex-wrap items-center gap-2.5 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-30 max-lg:border-t max-lg:border-gray-200 max-lg:bg-white/95 max-lg:px-4 max-lg:py-3 max-lg:shadow-[0_-4px_16px_rgba(15,23,42,0.08)] max-lg:backdrop-blur-lg">
              <ConfirmDialog
                trigger={
                  <Button
                    size="sm"
                    variant="adminApprove"
                    disabled={loading || alreadyVerified}
                  >
                    Verify payment
                  </Button>
                }
                title="Verify this payment?"
                description={`You are about to mark ${participantName}'s payment of ${formatRegistrationFee(payment.amount)} as verified. The participant will see payment verified on their portal.`}
                confirmLabel="Yes, verify payment"
                confirmClassName="admin-dialog-confirm"
                onConfirm={() => save(PAYMENT_STATUS.VERIFIED)}
              />
              <Button
                size="sm"
                variant="adminDestructive"
                disabled={loading || isProofRejected || isReturned}
                onClick={() => openReasonDialog(PAYMENT_STATUS.REJECTED)}
              >
                Reject proof
              </Button>
              {statusDirty ? (
                <Button
                  size="sm"
                  variant="adminOutline"
                  disabled={loading || statusControlsLocked}
                  className={cn(
                    statusControlsLocked &&
                      "pointer-events-none cursor-not-allowed opacity-50"
                  )}
                  onClick={() => void handleApplyStatus()}
                >
                  Apply status
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <Dialog
        open={reasonDialogOpen}
        onOpenChange={(open) => {
          setReasonDialogOpen(open);
          if (!open) {
            setPendingReasonStatus(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="border-brand-line bg-white text-brand-ink sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{reasonDialogTitle}</DialogTitle>
            <DialogDescription className="text-brand-ink-muted">
              {reasonDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">
            <label htmlFor="payment-reject-reason">
              Reason for participant <span className="text-red-600">*</span>
            </label>
            <Textarea
              id="payment-reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. The uploaded receipt is unclear and does not show the transaction amount."
              rows={4}
              className="admin-input mt-1"
              required
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="adminOutline"
              disabled={loading}
              onClick={() => setReasonDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="adminDestructive"
              disabled={loading || !rejectReason.trim()}
              onClick={() => void handleConfirmReason()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                reasonConfirmLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
