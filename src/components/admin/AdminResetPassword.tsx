"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOAST } from "@/lib/toast";
import { validateNewPassword } from "@/lib/password-policy";

export function AdminResetPassword({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const passwordError = validateNewPassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password }),
    });
    if (res.ok) {
      toast.success("Password updated");
      setPassword("");
      setOpen(false);
    } else {
      toast.error(TOAST.GENERIC_ERROR);
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <Button
        size="sm"
        variant="adminOutline"
        onClick={() => setOpen(true)}
        className="admin-reset-trigger"
      >
        <KeyRound className="mr-1.5 h-4 w-4" aria-hidden />
        Reset password
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-bold text-brand-ink">Reset password</span>
        <button
          type="button"
          className="cursor-pointer border-none bg-transparent text-xs font-semibold text-muted-foreground hover:text-green-800"
          onClick={() => {
            setOpen(false);
            setPassword("");
          }}
        >
          Cancel
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-2.5 [&_.admin-input]:min-w-0 [&_.admin-input]:max-w-[20rem] [&_.admin-input]:flex-[1_1_12rem]">
        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-input"
          aria-label="New password"
          autoFocus
        />
        <Button
          size="sm"
          variant="adminPrimary"
          disabled={loading}
          onClick={handleReset}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Set password"
          )}
        </Button>
      </div>
    </div>
  );
}
