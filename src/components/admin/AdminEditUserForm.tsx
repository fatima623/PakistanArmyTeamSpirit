"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/auth-routes";
import { adminInput } from "@/lib/admin-ui";
import { TOAST } from "@/lib/toast";

const GENDERS = ["Male", "Female", "Other"] as const;

type UserValues = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rank: string;
  gender: string;
  role: string;
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-user-detail-field">
      <label className="text-sm font-semibold text-[#0f172a]">{label}</label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export function AdminEditUserForm({ user }: { user: UserValues }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    rank: user.rank ?? "",
    gender: GENDERS.includes(user.gender as (typeof GENDERS)[number])
      ? user.gender
      : "Other",
    role: user.role ?? "user",
  });
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const applyFieldErrors = (data: { errors?: Record<string, string[]> }) => {
    if (data.errors) {
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(data.errors)) flat[k] = v[0];
      setErrors(flat);
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Account updated");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!applyFieldErrors(data)) {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setResetting(true);
    setErrors({});
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        toast.success("Password reset");
        setNewPassword("");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!applyFieldErrors(data)) {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSubmit} className="admin-surface space-y-5 p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName}>
            <Input
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className={adminInput}
            />
          </Field>
          <Field label="Last name" error={errors.lastName}>
            <Input
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className={adminInput}
            />
          </Field>
        </div>

        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={adminInput}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Rank" error={errors.rank}>
            <Input
              value={form.rank}
              onChange={(e) => set("rank", e.target.value)}
              placeholder="e.g. Capt"
              className={adminInput}
            />
          </Field>
          <Field label="Gender" error={errors.gender}>
            <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger className={adminInput}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Role" error={errors.role}>
          <Select value={form.role} onValueChange={(v) => set("role", v)}>
            <SelectTrigger className={adminInput}>
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
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="adminOutline"
            onClick={() => router.push("/admin/user-management")}
            disabled={saving}
          >
            Back
          </Button>
          <Button type="submit" variant="adminPrimary" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>

      <div className="admin-surface space-y-4 p-6">
        <div>
          <h2 className="text-sm font-semibold text-[#0f172a]">
            Reset password
          </h2>
          <p className="text-xs text-slate-500">
            Set a new temporary password for this account.
          </p>
        </div>
        <Field label="New password" error={errors.newPassword}>
          <Input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 8 chars, mixed case + number"
            className={adminInput}
          />
        </Field>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="adminOutline"
            onClick={handleResetPassword}
            disabled={resetting || newPassword.length === 0}
          >
            {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset password
          </Button>
        </div>
      </div>

      <div className="admin-surface flex items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-sm font-semibold text-[#0f172a]">Delete account</h2>
          <p className="text-xs text-slate-500">
            Permanently remove this user and their data.
          </p>
        </div>
        <DeleteUserButton userId={user.id} />
      </div>
    </div>
  );
}
