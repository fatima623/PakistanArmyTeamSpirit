"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { portalTableActionIconDanger } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import { TOAST } from "@/lib/toast";
export function DeleteUserButton({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <ConfirmDialog
      trigger={
        <Button
          size="sm"
          variant="adminDestructive"
          className={cn(portalTableActionIconDanger, className)}
          aria-label="Delete user"
          title="Delete user"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      }
      title="Delete user?"
      description="This will permanently delete the user and all associated unit data. This action cannot be undone."
      confirmLabel="Delete permanently"
      onConfirm={async () => {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success(TOAST.DELETE_SUCCESS);
          router.refresh();
        } else {
          const body = await res.json();
          toast.error(body.error ?? TOAST.GENERIC_ERROR);
        }
      }}
    />
  );
}
