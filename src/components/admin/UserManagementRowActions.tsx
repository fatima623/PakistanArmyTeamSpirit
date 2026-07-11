"use client";

import { memo } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { RegistrationRowAction } from "@/components/admin/RegistrationActions";
import { Button } from "@/components/ui/button";
import { portalTableActionIconView } from "@/lib/admin-ui";

export const UserManagementRowActions = memo(function UserManagementRowActions({
  userId,
  applicationStatus,
  canReview = false,
}: {
  userId: string;
  applicationStatus?: string;
  /** SD (Sports Directorate) only — shows the verification dialog action. */
  canReview?: boolean;
}) {
  return (
    <div
      className="inline-flex max-w-full flex-nowrap items-center justify-center gap-1.5"
      role="group"
      aria-label="Row actions"
    >
      <Button
        size="sm"
        variant="adminOutline"
        className={portalTableActionIconView}
        asChild
      >
        <Link
          href={`/admin/users/${userId}`}
          aria-label="View participant"
          title="View participant"
        >
          <Eye className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
      {canReview && applicationStatus ? (
        <RegistrationRowAction
          userId={userId}
          applicationStatus={applicationStatus}
        />
      ) : null}
      <DeleteUserButton userId={userId} />
    </div>
  );
});
