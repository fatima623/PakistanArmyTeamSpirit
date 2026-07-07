"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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

function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`admin-detail-field ${wide ? "admin-detail-field--wide" : ""}`.trim()}
    >
      <span className="admin-detail-field-label">{label}</span>
      <span className="admin-detail-field-value">{value || "—"}</span>
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

  return (
    <div className="admin-user-detail-stack">
        <section className="admin-user-detail-card">
          <div className="admin-user-detail-card-header">
            <h3 className="admin-user-detail-card-title">Transaction details</h3>
          </div>
          <div className="admin-user-detail-card-body">
            <div className="admin-detail-fields">
              <Field
                label="Amount"
                value={formatRegistrationFee(payment.amount)}
              />
              <Field
                label="Submitted"
                value={formatDateShort(payment.createdAt)}
              />
              <Field
                label="Payment date"
                value={
                  payment.paymentDate
                    ? formatDateDisplay(payment.paymentDate)
                    : "—"
                }
              />
              <Field
                label="Reference"
                value={payment.transactionReference ?? "—"}
                wide
              />
              {payment.uploaderName ? (
                <Field
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
                <Field
                  label="Proof uploaded"
                  value={formatDateShort(payment.proofUploadedAt)}
                />
              ) : null}
              {payment.proofFileSize != null ? (
                <Field
                  label="File size"
                  value={`${(payment.proofFileSize / 1024).toFixed(1)} KB`}
                />
              ) : null}
              {payment.proofOriginalFileName ? (
                <Field
                  label="Filename"
                  value={payment.proofOriginalFileName}
                  wide
                />
              ) : null}
            </div>
          </div>
        </section>

        {hasProof ? (
          <section className="admin-user-detail-card">
            <div className="admin-user-detail-card-header">
              <h3 className="admin-user-detail-card-title">Payment proof</h3>
            </div>
            <div className="admin-user-detail-card-body">
              <div className="admin-user-detail-proof-frame">
                <PaymentProofViewer
                  paymentId={payment.id}
                  access="admin"
                  mimeType={payment.proofMimeType}
                  fileName={
                    payment.proofOriginalFileName ??
                    payment.proofFileName ??
                    undefined
                  }
                  imageMaxHeight="max-h-[28rem]"
                />
              </div>
            </div>
          </section>
        ) : null}

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-header">
          <h3 className="admin-user-detail-card-title">Verify payment</h3>
        </div>
        <div className="admin-user-detail-card-body">
          <div className="admin-user-detail-status-row">
            <div className="admin-user-detail-status-item">
              <label>Payment status</label>
              <PaymentStatusBadge status={payment.status} showPrefix={false} />
            </div>
            <div className="admin-user-detail-status-item">
              <label>Amount due</label>
              <span className="text-sm font-medium text-cp-ink">
                {formatRegistrationFee(payment.amount)}
              </span>
            </div>
          </div>

          {statusHint ? (
            <p className="admin-user-detail-callout">{statusHint}</p>
          ) : null}

          <PaymentStatusTimeline
            status={payment.status}
            history={rejectionHistory}
          />

          <div className="admin-user-detail-field mt-4">
            <label htmlFor="payment-status">Update status</label>
            <div
              className={cn(
                statusControlsLocked &&
                  "admin-user-detail-status-controls--locked"
              )}
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
              <p className="admin-user-detail-status-controls-hint">
                {!canDecide
                  ? "View-only — payment decisions are made by the MT (Management Team)."
                  : "Payment has been verified. Reject proof to make changes."}
              </p>
            ) : null}
          </div>

          {canDecide ? (
            <div className="admin-user-detail-actions mt-4">
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
                      "admin-user-detail-status-controls--locked"
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
        <DialogContent className="border-cp-border bg-white text-cp-ink sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{reasonDialogTitle}</DialogTitle>
            <DialogDescription className="text-cp-ink-muted">
              {reasonDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="admin-user-detail-field">
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
    </div>
  );
}
