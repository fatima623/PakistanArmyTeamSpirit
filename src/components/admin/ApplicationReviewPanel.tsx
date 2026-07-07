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
    <section className="admin-user-detail-card">
      <div className="admin-user-detail-card-header">
        <h3 className="admin-user-detail-card-title">
          Registration verification (SD)
        </h3>
        <p className="admin-user-detail-card-desc">
          Verification is performed exclusively by the Sports Directorate.
          Payment verification is handled separately by the MT.
        </p>
      </div>
      <div className="admin-user-detail-card-body">
        <div className="admin-user-detail-status-row">
          <div className="admin-user-detail-status-item">
            <label>Registration status</label>
            <ApplicationStatusBadge
              status={applicationStatus}
              showPrefix={false}
            />
          </div>
          <div className="admin-user-detail-status-item">
            <label>Payment status</label>
            <PaymentStatusBadge status={paymentStatus} showPrefix={false} />
          </div>
          {suspended ? (
            <div className="admin-user-detail-status-item">
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

        <div className="admin-user-detail-actions">
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

        <div className="admin-user-detail-field mt-4">
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
