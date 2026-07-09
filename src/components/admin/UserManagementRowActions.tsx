"use client";

import { memo } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { Button } from "@/components/ui/button";
import { portalTableActionIconView } from "@/lib/admin-ui";

export const UserManagementRowActions = memo(function UserManagementRowActions({
  userId,
}: {
  userId: string;
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
      <DeleteUserButton userId={userId} />
    </div>
  );
});
