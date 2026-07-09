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
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/auth-routes";
import { adminInput } from "@/lib/admin-ui";
import { TOAST } from "@/lib/toast";

const GENDERS = ["Male", "Female", "Other"] as const;

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
    <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">
      <label className="text-sm font-semibold text-[#0f172a]">{label}</label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export function AdminCreateUserForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    rank: "",
    gender: "Other",
    role: "user",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const { user } = await res.json();
        toast.success("User created");
        router.push(`/admin/users/${user.id}`);
        return;
      }
      const data = await res.json();
      if (data.errors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(
          data.errors as Record<string, string[]>
        )) {
          flat[k] = v[0];
        }
        setErrors(flat);
      } else {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="admin-surface max-w-2xl space-y-5 p-6"
    >
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
        <Field label="Temporary password" error={errors.password}>
          <Input
            type="text"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Min 8 chars, mixed case + number"
            className={adminInput}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="adminOutline"
          onClick={() => router.push("/admin/user-management")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" variant="adminPrimary" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create user
        </Button>
      </div>
    </form>
  );
}
