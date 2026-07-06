"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { TOAST } from "@/lib/toast";

export function RejectButton({
  userId,
  initialRejected = false,
  className,
}: {
  userId: string;
  initialRejected?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejected, setRejected] = useState(initialRejected);

  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationStatus: "REJECTED" }),
      });
      if (res.ok) {
        setRejected(true);
        toast.success("Application returned for correction.");
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
    <button
      type="button"
      className={cn("admin-reject-btn", className)}
      onClick={handleReject}
      disabled={loading || rejected}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
      ) : rejected ? (
        "Rejected"
      ) : (
        "Reject"
      )}
    </button>
  );
}
