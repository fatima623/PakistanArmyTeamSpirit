"use client";

import { ApproveButton } from "@/components/admin/ApproveButton";
import { ApplicationStatusBadge } from "@/components/admin/StatusBadges";
import { APPLICATION_STATUS } from "@/lib/constants";

export function UserApplicationStatusCell({
  userId,
  applicationStatus,
  suspended = false,
  canApprove = false,
}: {
  userId: string;
  applicationStatus: string;
  suspended?: boolean;
  /** SD (Sports Directorate) only — enables the quick-approve button. */
  canApprove?: boolean;
}) {
  const isPending = applicationStatus === APPLICATION_STATUS.PENDING;

  return (
    <div className="admin-users-app-status-cell">
      {isPending && canApprove ? (
        <ApproveButton userId={userId} />
      ) : (
        <ApplicationStatusBadge
          status={applicationStatus}
          showPrefix={false}
          density="table"
          className="admin-users-status-badge--app"
        />
      )}
      {suspended ? (
        <span className="ops-status-pill ops-status-rejected" title="Suspended">
          Suspended
        </span>
      ) : null}
    </div>
  );
}
