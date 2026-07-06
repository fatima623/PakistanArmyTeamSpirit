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

export function ApplicationReviewPanel({
  userId,
  applicationStatus,
  paymentStatus,
  rejectionReason,
  suspended: initialSuspended,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState(rejectionReason ?? "");
  const [suspended, setSuspended] = useState(initialSuspended);

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

  const handleApprove = async () => {
    setLoading("approve");
    const ok = await update({
      applicationStatus: APPLICATION_STATUS.APPROVED,
    });
    if (ok) toast.success(TOAST.APPROVE_SUCCESS);
    setLoading(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Provide a rejection reason");
      return;
    }
    setLoading("reject");
    const ok = await update({
      applicationStatus: APPLICATION_STATUS.REJECTED,
      rejectionReason: rejectReason.trim(),
    });
    if (ok) toast.success(TOAST.REJECT_SUCCESS);
    setLoading(null);
  };

  const handleSuspend = async () => {
    setLoading("suspend");
    const ok = await update({ suspended: !suspended });
    if (ok) {
      setSuspended(!suspended);
      toast.success(TOAST.SAVE_SUCCESS);
    }
    setLoading(null);
  };

  return (
    <section className="admin-user-detail-card">
      <div className="admin-user-detail-card-header">
        <h3 className="admin-user-detail-card-title">Application review</h3>
        <p className="admin-user-detail-card-desc">
          Approve the application here. Payment verification is handled
          separately under Payment Verification.
        </p>
      </div>
      <div className="admin-user-detail-card-body">
        <div className="admin-user-detail-status-row">
          <div className="admin-user-detail-status-item">
            <label>Application status</label>
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
            onClick={handleApprove}
          >
            {loading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Approve"
            )}
          </Button>
          <Button
            size="sm"
            variant="adminDestructive"
            disabled={loading !== null}
            onClick={handleReject}
          >
            {loading === "reject" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Return application"
            )}
          </Button>
          <Button
            size="sm"
            variant="adminOutline"
            disabled={loading !== null}
            onClick={handleSuspend}
          >
            {suspended ? "Unsuspend account" : "Suspend account"}
          </Button>
        </div>

        <div className="admin-user-detail-field mt-4">
          <label htmlFor="reject-reason">Return reason (required to return)</label>
          <Textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="admin-input"
            placeholder="Explain what the participant must correct…"
          />
        </div>
      </div>
    </section>
  );
}
