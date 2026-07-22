"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  CornerUpLeft,
  Loader2,
  RotateCcw,
  ShieldCheck,
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
import {
  ApplicationStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadges";
import { APPLICATION_STATUS } from "@/lib/constants";
import { TOAST } from "@/lib/toast";
import { cn } from "@/lib/utils";

type ActionKey = "approve" | "review" | "return" | "reject";

type ActionMeta = {
  status: string;
  title: string;
  cardLabel: string;
  cardHint: string;
  prompt: string;
  note: string;
  needsReason: boolean;
  success: string;
  confirmLabel: string;
  icon: LucideIcon;
  /** icon disc inside the dialog */
  disc: string;
  /** solid confirm button */
  confirmBtn: string;
  /** action card (panel) */
  card: string;
  cardIcon: string;
};

const ACTIONS: Record<ActionKey, ActionMeta> = {
  approve: {
    status: APPLICATION_STATUS.APPROVED,
    title: "Approve Registration",
    cardLabel: "Approve",
    cardHint: "Approve this registration",
    prompt: "Are you sure you want to approve this registration?",
    note: "This action cannot be undone.",
    needsReason: false,
    success: "Registration approved",
    confirmLabel: "Confirm",
    icon: CheckCircle2,
    disc: "bg-green-100 text-green-700",
    confirmBtn:
      "bg-green-700 text-white hover:bg-green-800 disabled:bg-green-300",
    card: "border-green-200 bg-green-50/50 hover:border-green-400 hover:bg-green-50",
    cardIcon: "text-green-700",
  },
  review: {
    status: APPLICATION_STATUS.UNDER_REVIEW,
    title: "Mark Under Review",
    cardLabel: "Mark Under Review",
    cardHint: "Move to review queue",
    prompt: "Move this registration to the review queue?",
    note: "The participant will see that their application is being reviewed.",
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
    status: APPLICATION_STATUS.RETURNED,
    title: "Return for Correction",
    cardLabel: "Return for Correction",
    cardHint: "Ask for changes",
    prompt: "Send this registration back to the participant for correction.",
    note: "Your message below is shown to the participant.",
    needsReason: true,
    success: "Returned for correction",
    confirmLabel: "Return with message",
    icon: CornerUpLeft,
    disc: "bg-orange-100 text-orange-600",
    confirmBtn:
      "bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-300",
    card: "border-orange-200 bg-orange-50/50 hover:border-orange-400 hover:bg-orange-50",
    cardIcon: "text-orange-600",
  },
  reject: {
    status: APPLICATION_STATUS.REJECTED,
    title: "Reject Registration",
    cardLabel: "Reject",
    cardHint: "Reject this registration",
    prompt: "Reject this registration permanently.",
    note: "Your message below is shown to the participant.",
    needsReason: true,
    success: "Registration rejected",
    confirmLabel: "Reject with message",
    icon: XCircle,
    disc: "bg-red-100 text-red-600",
    confirmBtn: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    card: "border-red-200 bg-red-50/50 hover:border-red-400 hover:bg-red-50",
    cardIcon: "text-red-600",
  },
};

const ACTION_ORDER: ActionKey[] = ["approve", "review", "return", "reject"];

/**
 * Decision statuses. Once a registration reaches one of these, a decision has
 * been made — the taken action stays visible but every other action is locked
 * to prevent duplicate processing. "Under review" is a transitional queue state
 * (not a decision), so it does not lock the other actions.
 */
const REGISTRATION_DECIDED: string[] = [
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.RETURNED,
  APPLICATION_STATUS.REJECTED,
];

/**
 * Confirmation / reason dialog shared by the SD verification panel and the
 * Participation Requests table row action.
 *
 *  - Approve / Mark Under Review → centered confirm card (“This action cannot
 *    be undone.”) per the reference design.
 *  - Return for Correction / Reject → message dialog; the reason is required
 *    and is sent to the participant.
 */
function RegistrationActionDialog({
  userId,
  action,
  initialReason,
  onOpenChange,
}: {
  userId: string;
  action: ActionKey | null;
  initialReason?: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset the message whenever a new action is opened.
  useEffect(() => {
    if (action) {
      setReason(initialReason ?? "");
      setLoading(false);
    }
  }, [action, initialReason]);

  if (!action) {
    return null;
  }

  const meta = ACTIONS[action];
  const Icon = meta.icon;
  const reasonMissing = meta.needsReason && !reason.trim();

  const submit = async () => {
    if (reasonMissing) {
      toast.error("Provide a message for the participant");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationStatus: meta.status,
        ...(meta.needsReason ? { rejectionReason: reason.trim() } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? TOAST.GENERIC_ERROR);
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
                  {meta.prompt} {meta.note}
                </DialogDescription>
              </div>
            </div>

            <div className="mt-1">
              <label
                htmlFor={`registration-action-reason-${userId}`}
                className="mb-1.5 block text-[0.8125rem] font-semibold text-slate-700"
              >
                Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                id={`registration-action-reason-${userId}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                autoFocus
                
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
              {meta.prompt}
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
 * Registration Verification (SD) — participant detail page panel.
 * Status summary + four action cards; every action confirms via dialog.
 */
export function RegistrationVerificationPanel({
  userId,
  applicationStatus,
  paymentStatus,
  suspended,
  rejectionReason,
}: {
  userId: string;
  applicationStatus: string;
  paymentStatus: string;
  suspended: boolean;
  rejectionReason: string | null;
}) {
  const [action, setAction] = useState<ActionKey | null>(null);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="border-b border-gray-200 bg-slate-50 px-[18px] py-3.5">
        <h3 className="m-0 flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
          <ShieldCheck size={16} aria-hidden />
          Registration Verification (SD)
        </h3>
        <p className="m-0 mt-0.5 pl-6 text-[0.78rem] text-slate-500">
          Review and verify participant registration details
        </p>
      </header>

      <div className="flex flex-col gap-4 p-[18px]">
        <div className="grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex flex-col items-start gap-1.5 px-4 py-3">
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">
              Registration Status
            </span>
            <ApplicationStatusBadge status={applicationStatus} showPrefix={false} />
          </div>
          <div className="flex flex-col items-start gap-1.5 px-4 py-3">
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">
              Payment Status
            </span>
            <PaymentStatusBadge status={paymentStatus} showPrefix={false} />
          </div>
          <div className="flex flex-col items-start gap-1.5 px-4 py-3">
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">
              Account Status
            </span>
            <span
              className={cn(
                "ops-status-badge",
                suspended ? "ops-status-rejected" : "ops-status-approved"
              )}
            >
              {suspended ? "Suspended" : "Active"}
            </span>
          </div>
        </div>

        <div>
          <h4 className="m-0 text-[0.875rem] font-bold tracking-[-0.01em] text-slate-900">
            Action
          </h4>
          <p className="m-0 mt-0.5 text-[0.78rem] text-slate-500">
            Choose an action to proceed with this registration.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {ACTION_ORDER.map((key) => {
              const meta = ACTIONS[key];
              const Icon = meta.icon;
              const isCurrent = applicationStatus === meta.status;
              const decided = REGISTRATION_DECIDED.includes(applicationStatus);
              const locked = decided && !isCurrent;
              const disabled = isCurrent || locked;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => setAction(key)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border px-3 py-3.5 text-center transition-all duration-150",
                    meta.card,
                    isCurrent && "cursor-default hover:translate-y-0",
                    locked && "cursor-not-allowed opacity-45 hover:translate-y-0",
                    !disabled &&
                      "hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)]"
                  )}
                  title={
                    isCurrent
                      ? "Current status — this action was taken"
                      : locked
                        ? "A decision has already been made"
                        : meta.cardHint
                  }
                >
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-[0.8125rem] font-bold",
                      meta.cardIcon
                    )}
                  >
                    <Icon size={15} aria-hidden />
                    {meta.cardLabel}
                  </span>
                  <span className="text-[0.6875rem] font-medium text-slate-500">
                    {meta.cardHint}
                  </span>
                </button>
              );
            })}
          </div>

          {rejectionReason ? (
            <p className="m-0 mt-3 rounded-[10px] border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[0.78rem] leading-[1.5] text-amber-900">
              <span className="font-bold">Last message to participant:</span>{" "}
              {rejectionReason}
            </p>
          ) : null}
        </div>
      </div>

      <RegistrationActionDialog
        userId={userId}
        action={action}
        initialReason={rejectionReason}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
      />
    </section>
  );
}

/**
 * Participation Requests table — row action that opens the verification
 * dialog (edit icon while pending / under review, revisit icon once decided).
 */
export function RegistrationRowAction({
  userId,
  applicationStatus,
}: {
  userId: string;
  applicationStatus: string;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ActionKey | null>(null);

  const undecided =
    applicationStatus === APPLICATION_STATUS.PENDING ||
    applicationStatus === APPLICATION_STATUS.UNDER_REVIEW;
  const TriggerIcon = undecided ? SquarePen : RotateCcw;

  return (
    <>
      <Button
        size="sm"
        variant="adminOutline"
        className={cn(
          "portal-table-action-btn portal-table-action-btn--icon",
          undecided
            ? "portal-table-action-btn--info"
            : "portal-table-action-btn--warning"
        )}
        aria-label={undecided ? "Review registration" : "Revisit decision"}
        title={undecided ? "Review registration" : "Revisit decision"}
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
            Registration verification
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-[0.8125rem] text-slate-500">
            Choose an action to proceed with this registration.
          </DialogDescription>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ACTION_ORDER.map((key) => {
              const meta = ACTIONS[key];
              const Icon = meta.icon;
              const isCurrent = applicationStatus === meta.status;
              const decided = REGISTRATION_DECIDED.includes(applicationStatus);
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
      <RegistrationActionDialog
        userId={userId}
        action={action}
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
