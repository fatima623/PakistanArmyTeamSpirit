"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOAST } from "@/lib/toast";
import { validateNewPassword } from "@/lib/password-policy";

export function AdminResetPassword({ userId }: { userId: string }) {
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
    } else {
      toast.error(TOAST.GENERIC_ERROR);
    }
    setLoading(false);
  };

  return (
    <section className="admin-user-detail-card">
      <div className="admin-user-detail-card-header">
        <h3 className="admin-user-detail-card-title">Reset password</h3>
        <p className="admin-user-detail-card-desc">
          Set a new password for this participant account.
        </p>
      </div>
      <div className="admin-user-detail-card-body">
        <div className="admin-user-detail-reset-row">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            aria-label="New password"
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
    </section>
  );
}
