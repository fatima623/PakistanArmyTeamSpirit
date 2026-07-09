"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TOAST } from "@/lib/toast";
import { APPLICATION_STATUS } from "@/lib/constants";
import {
  ApplicationStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadges";

type Props = {
  userId: string;
  applicationStatus: string;
  paymentStatus: string;
  rejectionReason: string | null;
  suspended: boolean;
};

/**
 * Registration verification panel — rendered ONLY for the SD (Sports
 * Directorate). Admin and MT have read-only visibility elsewhere.
 */
export function ApplicationReviewPanel({
  userId,
  applicationStatus,
  paymentStatus,
  rejectionReason,
  suspended,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [reason, setReason] = useState(rejectionReason ?? "");

  const update = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? TOAST.GENERIC_ERROR);
      return false;
    }
    router.refresh();
    return true;
  };

  const act = async (
    key: string,
    status: string,
    opts?: { requireReason?: boolean; success?: string }
  ) => {
    if (opts?.requireReason && !reason.trim()) {
      toast.error("Provide a reason for the participant");
      return;
    }
    setLoading(key);
    const ok = await update({
      applicationStatus: status,
      ...(opts?.requireReason ? { rejectionReason: reason.trim() } : {}),
    });
    if (ok) toast.success(opts?.success ?? TOAST.SAVE_SUCCESS);
    setLoading(null);
  };

  return (
    <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
      <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
        <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">
          Registration verification (SD)
        </h3>
      </div>
      <div className="px-[1.1rem] pb-4 pt-[0.9rem]">
        <div className="flex flex-wrap gap-x-5 gap-y-3 rounded-[10px] border border-brand-line/60 bg-muted/40 px-[0.9rem] py-3">
          <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.72rem] [&>label]:font-semibold [&>label]:uppercase [&>label]:tracking-[0.07em] [&>label]:text-muted-foreground">
            <label>Registration status</label>
            <ApplicationStatusBadge
              status={applicationStatus}
              showPrefix={false}
            />
          </div>
          <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.72rem] [&>label]:font-semibold [&>label]:uppercase [&>label]:tracking-[0.07em] [&>label]:text-muted-foreground">
            <label>Payment status</label>
            <PaymentStatusBadge status={paymentStatus} showPrefix={false} />
          </div>
          {suspended ? (
            <div className="[&>label]:mb-1 [&>label]:block [&>label]:text-[0.72rem] [&>label]:font-semibold [&>label]:uppercase [&>label]:tracking-[0.07em] [&>label]:text-muted-foreground">
              <label>Account</label>
              <span
                className="ops-status-pill ops-status-rejected"
                title="Suspended"
              >
                Suspended
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-[0.9rem] flex flex-wrap gap-2 [&_.ops-btn-approve]:!border-[var(--portal-approve)] [&_.ops-btn-approve]:!bg-[var(--portal-approve)] [&_.ops-btn-approve]:!text-white [&_.ops-btn-approve:hover]:!border-[var(--portal-approve-hover)] [&_.ops-btn-approve:hover]:!bg-[var(--portal-approve-hover)] [&_.ops-btn-approve:disabled]:!border-slate-300 [&_.ops-btn-approve:disabled]:!bg-slate-200 [&_.ops-btn-approve:disabled]:!text-slate-900 [&_.ops-btn-approve:disabled]:!opacity-100 [&_.ops-btn-secondary]:!border-gray-300 [&_.ops-btn-secondary]:!bg-white [&_.ops-btn-secondary]:!text-slate-600">
          <Button
            size="sm"
            variant="adminApprove"
            disabled={
              loading !== null ||
              applicationStatus === APPLICATION_STATUS.APPROVED
            }
            onClick={() =>
              act("approve", APPLICATION_STATUS.APPROVED, {
                success: "Registration approved",
              })
            }
          >
            {loading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Approve"
            )}
          </Button>
          <Button
            size="sm"
            variant="adminOutline"
            disabled={
              loading !== null ||
              applicationStatus === APPLICATION_STATUS.UNDER_REVIEW
            }
            onClick={() =>
              act("review", APPLICATION_STATUS.UNDER_REVIEW, {
                success: "Marked as under review",
              })
            }
          >
            {loading === "review" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Mark under review"
            )}
          </Button>
          <Button
            size="sm"
            variant="adminWarning"
            disabled={loading !== null}
            onClick={() =>
              act("return", APPLICATION_STATUS.RETURNED, {
                requireReason: true,
                success: "Returned for correction",
              })
            }
          >
            {loading === "return" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Return for correction"
            )}
          </Button>
          <Button
            size="sm"
            variant="adminDestructive"
            disabled={loading !== null}
            onClick={() =>
              act("reject", APPLICATION_STATUS.REJECTED, {
                requireReason: true,
                success: "Registration rejected",
              })
            }
          >
            {loading === "reject" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Reject"
            )}
          </Button>
        </div>

        <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y mt-4">
          <label htmlFor="reject-reason">
            Reason (required to return or reject)
          </label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="admin-input"
            placeholder="Explain what the participant must correct…"
          />
        </div>
      </div>
    </section>
  );
}
