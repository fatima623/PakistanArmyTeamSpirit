"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  CornerUpLeft,
  Loader2,
  RotateCcw,
  SquarePen,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_STATUS, normalizePaymentStatus } from "@/lib/constants";
import { TOAST } from "@/lib/toast";
import { cn } from "@/lib/utils";

type ActionKey = "verify" | "review" | "return" | "reject";

type ActionMeta = {
  status: string;
  title: string;
  cardLabel: string;
  cardHint: string;
  prompt: (name: string, amount: string) => string;
  note: string;
  needsReason: boolean;
  success: string;
  confirmLabel: string;
  icon: LucideIcon;
  disc: string;
  confirmBtn: string;
  card: string;
  cardIcon: string;
};

const ACTIONS: Record<ActionKey, ActionMeta> = {
  verify: {
    status: PAYMENT_STATUS.VERIFIED,
    title: "Verify Payment",
    cardLabel: "Verify Payment",
    cardHint: "Approve this payment proof",
    prompt: (name, amount) =>
      `Are you sure you want to verify ${name}'s payment of ${amount}?`,
    note: "The participant will see payment verified on their portal.",
    needsReason: false,
    success: "Payment verified",
    confirmLabel: "Confirm",
    icon: CheckCircle2,
    disc: "bg-green-100 text-green-700",
    confirmBtn:
      "bg-green-700 text-white hover:bg-green-800 disabled:bg-green-300",
    card: "border-green-200 bg-green-50/50 hover:border-green-400 hover:bg-green-50",
    cardIcon: "text-green-700",
  },
  review: {
    status: PAYMENT_STATUS.UNDER_REVIEW,
    title: "Mark Under Review",
    cardLabel: "Mark Under Review",
    cardHint: "Move to review queue",
    prompt: () => "Move this payment proof to the review queue?",
    note: "The participant will see that their proof is being reviewed.",
    needsReason: false,
    success: "Marked as under review",
    confirmLabel: "Confirm",
    icon: Clock,
    disc: "bg-sky-100 text-sky-700",
    confirmBtn: "bg-sky-700 text-white hover:bg-sky-800 disabled:bg-sky-300",
    card: "border-sky-200 bg-sky-50/50 hover:border-sky-400 hover:bg-sky-50",
    cardIcon: "text-sky-700",
  },
  return: {
    status: PAYMENT_STATUS.RETURNED,
    title: "Return for Correction",
    cardLabel: "Return for Correction",
    cardHint: "Ask for resubmission",
    prompt: (name) => `Send ${name}'s payment proof back for correction.`,
    note: "Your message below is shown to the participant.",
    needsReason: true,
    success: "Payment returned for correction",
    confirmLabel: "Return with message",
    icon: CornerUpLeft,
    disc: "bg-orange-100 text-orange-600",
    confirmBtn:
      "bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-300",
    card: "border-orange-200 bg-orange-50/50 hover:border-orange-400 hover:bg-orange-50",
    cardIcon: "text-orange-600",
  },
  reject: {
    status: PAYMENT_STATUS.REJECTED,
    title: "Reject Proof",
    cardLabel: "Reject Proof",
    cardHint: "Reject this payment proof",
    prompt: (name) => `Reject ${name}'s payment proof.`,
    note: "Your message below is shown to the participant.",
    needsReason: true,
    success: "Payment proof rejected",
    confirmLabel: "Reject with message",
    icon: XCircle,
    disc: "bg-red-100 text-red-600",
    confirmBtn: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    card: "border-red-200 bg-red-50/50 hover:border-red-400 hover:bg-red-50",
    cardIcon: "text-red-600",
  },
};

const ACTION_ORDER: ActionKey[] = ["verify", "review", "return", "reject"];

/**
 * Decision statuses. Once a payment reaches one of these, a decision has been
 * made — the taken action stays visible while every other action is locked to
 * prevent duplicate processing. "Under review" is a transitional queue state
 * (auto-set when the MT opens the proof), so it does not lock the actions.
 */
const PAYMENT_DECIDED: string[] = [
  PAYMENT_STATUS.VERIFIED,
  PAYMENT_STATUS.RETURNED,
  PAYMENT_STATUS.REJECTED,
];

/**
 * Confirmation / reason dialog shared by the MT verification panel and the
 * payments table row action.
 */
function PaymentActionDialog({
  paymentId,
  action,
  participantName,
  amountLabel,
  onOpenChange,
}: {
  paymentId: string;
  action: ActionKey | null;
  participantName: string;
  amountLabel: string;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (action) {
      setReason("");
      setLoading(false);
    }
  }, [action]);

  if (!action) return null;

  const meta = ACTIONS[action];
  const Icon = meta.icon;
  const reasonMissing = meta.needsReason && !reason.trim();

  const submit = async () => {
    if (reasonMissing) {
      toast.error("Provide a message for the participant");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: meta.status,
        ...(meta.needsReason ? { rejectionReason: reason.trim() } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const reasonError = (body as { errors?: { rejectionReason?: string[] } })
        .errors?.rejectionReason?.[0];
      toast.error(
        reasonError ??
          (body as { error?: string }).error ??
          TOAST.GENERIC_ERROR
      );
      setLoading(false);
      return;
    }
    toast.success(meta.success);
    setLoading(false);
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={!!action} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent
        dir="ltr"
        className={cn(
          "border-brand-line bg-white text-brand-ink shadow-[0_8px_30px_rgba(28,33,25,0.14)]",
          meta.needsReason ? "max-w-md" : "max-w-[400px]"
        )}
      >
        {meta.needsReason ? (
          <>
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "inline-flex h-10 w-10 flex-none items-center justify-center rounded-full",
                  meta.disc
                )}
                aria-hidden
              >
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-[1rem] font-bold tracking-[-0.01em] text-slate-900">
                  {meta.title}
                </DialogTitle>
                <DialogDescription className="mt-1 text-[0.8125rem] leading-[1.5] text-slate-500">
                  {meta.prompt(participantName, amountLabel)} {meta.note}
                </DialogDescription>
              </div>
            </div>

            <div className="mt-1">
              <label
                htmlFor={`payment-action-reason-${paymentId}`}
                className="mb-1.5 block text-[0.8125rem] font-semibold text-slate-700"
              >
                Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                id={`payment-action-reason-${paymentId}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                autoFocus
                placeholder="e.g. The uploaded receipt is unclear and does not show the transaction amount."
                className="min-h-[6rem] resize-y rounded-[10px] border-slate-200 text-[0.875rem] text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="mt-1 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[0.8125rem] font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || reasonMissing}
                onClick={() => void submit()}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-[0.8125rem] font-semibold shadow-sm transition-colors disabled:cursor-not-allowed",
                  meta.confirmBtn
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {meta.confirmLabel}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center px-1 py-2 text-center">
            <span
              className={cn(
                "inline-flex h-14 w-14 items-center justify-center rounded-full",
                meta.disc
              )}
              aria-hidden
            >
              <Icon size={28} />
            </span>
            <DialogTitle className="mt-3.5 text-[1.05rem] font-bold tracking-[-0.01em] text-slate-900">
              {meta.title}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[0.8125rem] leading-[1.55] text-slate-500">
              {meta.prompt(participantName, amountLabel)}
              <br />
              {meta.note}
            </DialogDescription>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-[0.8125rem] font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void submit()}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-5 text-[0.8125rem] font-semibold shadow-sm transition-colors disabled:cursor-not-allowed",
                  meta.confirmBtn
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {meta.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Payment verification actions — MT (Management Team) only. Four action cards;
 * once a decision (verify / return / reject) is made, the taken action stays
 * visible while the others are locked to prevent duplicate processing.
 */
export function PaymentVerificationActions({
  paymentId,
  status,
  participantName,
  amountLabel,
}: {
  paymentId: string;
  status: string;
  participantName: string;
  amountLabel: string;
}) {
  const [action, setAction] = useState<ActionKey | null>(null);
  const currentStatus = normalizePaymentStatus(status);
  const decided = PAYMENT_DECIDED.includes(currentStatus);

  return (
    <div>
      <h4 className="m-0 text-[0.875rem] font-bold tracking-[-0.01em] text-slate-900">
        Action
      </h4>
      <p className="m-0 mt-0.5 text-[0.78rem] text-slate-500">
        Choose an action to proceed with this payment.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {ACTION_ORDER.map((key) => {
          const cardMeta = ACTIONS[key];
          const CardIcon = cardMeta.icon;
          const isCurrent = currentStatus === cardMeta.status;
          const locked = decided && !isCurrent;
          const disabled = isCurrent || locked;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => setAction(key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-3 py-3.5 text-center transition-colors duration-150",
                cardMeta.card,
                isCurrent && "cursor-default",
                locked && "cursor-not-allowed opacity-45"
              )}
              title={
                isCurrent
                  ? "Current status — this action was taken"
                  : locked
                    ? "A decision has already been made"
                    : cardMeta.cardHint
              }
            >
              <span
                className={cn(
                  "flex items-center gap-1.5 text-[0.8125rem] font-bold",
                  cardMeta.cardIcon
                )}
              >
                <CardIcon size={15} aria-hidden />
                {cardMeta.cardLabel}
              </span>
              <span className="text-[0.6875rem] font-medium text-slate-500">
                {cardMeta.cardHint}
              </span>
            </button>
          );
        })}
      </div>

      <PaymentActionDialog
        paymentId={paymentId}
        action={action}
        participantName={participantName}
        amountLabel={amountLabel}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
      />
    </div>
  );
}

/**
 * Payments table — inline row action that opens the verification dialog
 * (edit icon while undecided, revisit icon once a decision is made). Mirrors
 * the SD RegistrationRowAction on /admin/users.
 */
export function PaymentRowAction({
  paymentId,
  status,
  participantName,
  amountLabel,
}: {
  paymentId: string;
  status: string;
  participantName: string;
  amountLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ActionKey | null>(null);
  const currentStatus = normalizePaymentStatus(status);
  const decided = PAYMENT_DECIDED.includes(currentStatus);
  const TriggerIcon = decided ? RotateCcw : SquarePen;

  return (
    <>
      <Button
        size="sm"
        variant="adminOutline"
        className={cn(
          "portal-table-action-btn portal-table-action-btn--icon",
          decided
            ? "portal-table-action-btn--warning"
            : "portal-table-action-btn--info"
        )}
        aria-label={decided ? "Revisit payment decision" : "Review payment"}
        title={decided ? "Revisit payment decision" : "Review payment"}
        onClick={() => setOpen(true)}
      >
        <TriggerIcon className="h-4 w-4" aria-hidden />
      </Button>

      {/* Step 1 — choose an action */}
      <Dialog
        open={open && !action}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setAction(null);
        }}
      >
        <DialogContent dir="ltr" className="max-w-md border-brand-line bg-white text-brand-ink shadow-[0_8px_30px_rgba(28,33,25,0.14)]">
          <DialogTitle className="text-[1rem] font-bold tracking-[-0.01em] text-slate-900">
            Payment verification
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-[0.8125rem] text-slate-500">
            Choose an action to proceed with this payment.
          </DialogDescription>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ACTION_ORDER.map((key) => {
              const meta = ACTIONS[key];
              const Icon = meta.icon;
              const isCurrent = currentStatus === meta.status;
              const locked = decided && !isCurrent;
              const disabled = isCurrent || locked;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => setAction(key)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[0.8125rem] font-bold transition-colors",
                    meta.card,
                    meta.cardIcon,
                    isCurrent && "cursor-default",
                    locked && "cursor-not-allowed opacity-45"
                  )}
                  title={
                    isCurrent
                      ? "Current status — this action was taken"
                      : locked
                        ? "A decision has already been made"
                        : meta.cardHint
                  }
                >
                  <Icon size={15} aria-hidden />
                  <span className="min-w-0">
                    {meta.cardLabel}
                    <span className="mt-0.5 block text-[0.6875rem] font-medium text-slate-500">
                      {meta.cardHint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 2 — confirm / message */}
      <PaymentActionDialog
        paymentId={paymentId}
        action={action}
        participantName={participantName}
        amountLabel={amountLabel}
        onOpenChange={(o) => {
          if (!o) {
            setAction(null);
            setOpen(false);
          }
        }}
      />
    </>
  );
}
