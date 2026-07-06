"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/auth-routes";
import { TOAST } from "@/lib/toast";

/** Admin-only control to change a user's role (participant / SDBS / MTD / admin). */
export function AdminRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);

  const dirty = role !== currentRole;

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        toast.success("Role updated");
        router.refresh();
        return;
      }
      const data = await res.json();
      toast.error(data.error ?? TOAST.GENERIC_ERROR);
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="admin-label mb-1 block">Role</span>
        <Select value={role} onValueChange={setRole} disabled={saving}>
          <SelectTrigger className="admin-input min-w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSIGNABLE_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r] ?? r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <Button
        variant="adminPrimary"
        size="sm"
        onClick={save}
        disabled={!dirty || saving}
      >
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save role
      </Button>
    </div>
  );
}
