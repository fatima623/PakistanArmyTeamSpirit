"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { portalTableActionIconDanger } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import { TOAST } from "@/lib/toast";

export function DeletePostButton({
  postId,
  className,
}: {
  postId: string;
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
          aria-label="Delete post"
          title="Delete post"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      }
      title="Delete news post?"
      description="This will permanently delete the news post."
      confirmLabel="Delete"
      onConfirm={async () => {
        const res = await fetch(`/api/admin/news/${postId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success(TOAST.DELETE_SUCCESS);
          router.refresh();
        } else {
          toast.error(TOAST.GENERIC_ERROR);
        }
      }}
    />
  );
}
