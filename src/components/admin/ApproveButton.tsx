"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOAST } from "@/lib/toast";
export function ApproveButton({
  userId,
  initialApproved = false,
  className,
}: {
  userId: string;
  initialApproved?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(initialApproved);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationStatus: "APPROVED" }),
      });
      if (res.ok) {
        setApproved(true);
        toast.success(TOAST.APPROVE_SUCCESS);
        router.refresh();
      } else {
        toast.error(TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="adminApproveCompact"
      className={cn(className)}
      onClick={handleApprove}
      disabled={loading || approved}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : approved ? (
        "Approved"
      ) : (
        "Approve"
      )}
    </Button>
  );
}
