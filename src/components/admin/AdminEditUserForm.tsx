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
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/auth-routes";
import { adminInput } from "@/lib/admin-ui";
import {
  CUSTOM_COUNTRY_OPTION,
  isValidCountry,
  resolveCountryForSubmit,
} from "@/lib/countries";
import {
  PAKISTAN_COUNTRY,
  isInternationalParticipant,
} from "@/lib/participant-country";
import { TOAST } from "@/lib/toast";

const GENDERS = ["Male", "Female", "Other"] as const;

/** Only participants have a country; staff accounts (sdbs/mtd/admin) do not. */
const PARTICIPANT_ROLE = "user";

type UserValues = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rank: string;
  gender: string;
  role: string;
  country: string | null;
  nationality: string | null;
};

/**
 * Split the stored country into the two form controls. A country that predates
 * the picker (or was typed in via "Other") is not in WORLD_COUNTRIES, so it maps
 * back to Other + custom text rather than being silently dropped. A missing
 * country stays unselected — we must not invent one for the participants whose
 * country was never captured.
 */
function seedCountryFields(stored: string | null | undefined): {
  country: string;
  customCountry: string;
} {
  const value = stored?.trim() ?? "";
  if (!value) return { country: "", customCountry: "" };
  if (value !== CUSTOM_COUNTRY_OPTION && isValidCountry(value)) {
    return { country: value, customCountry: "" };
  }
  return {
    country: CUSTOM_COUNTRY_OPTION,
    customCountry: value === CUSTOM_COUNTRY_OPTION ? "" : value,
  };
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="[&>label]:mb-[0.35rem] [&>label]:block [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-brand-ink-muted [&_textarea]:min-h-[5rem] [&_textarea]:resize-y">
      <label className="text-sm font-semibold text-[#0f172a]">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="mt-[0.35rem] text-[0.75rem] leading-snug text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export function AdminEditUserForm({ user }: { user: UserValues }) {
  const router = useRouter();
  const seededCountry = seedCountryFields(user.country);
  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    rank: user.rank ?? "",
    gender: GENDERS.includes(user.gender as (typeof GENDERS)[number])
      ? user.gender
      : "Other",
    role: user.role ?? PARTICIPANT_ROLE,
    country: seededCountry.country,
    customCountry: seededCountry.customCountry,
    nationality: user.nationality ?? "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isParticipant = form.role === PARTICIPANT_ROLE;
  const isOtherCountrySelected = form.country === CUSTOM_COUNTRY_OPTION;
  /* False for Pakistan and for an unselected country; "Other" counts as
     international until the typed-in country says otherwise. */
  const isInternational = isInternationalParticipant(form.country);
  const hasNoCountryOnRecord = !user.country?.trim();

  /* Same rules as public registration: Pakistan implies Pakistani nationality
     and hides the custom-country box; leaving Pakistan clears the auto-filled
     nationality but keeps one the admin typed. */
  const handleCountryChange = (next: string) =>
    setForm((f) => ({
      ...f,
      country: next,
      customCountry: next === CUSTOM_COUNTRY_OPTION ? f.customCountry : "",
      nationality:
        next === PAKISTAN_COUNTRY
          ? "Pakistani"
          : f.nationality === "Pakistani"
            ? ""
            : f.nationality,
    }));

  const applyFieldErrors = (data: { errors?: Record<string, string[]> }) => {
    if (data.errors) {
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(data.errors)) flat[k] = v[0];
      setErrors(flat);
      return true;
    }
    return false;
  };

  /* The PUT schema enforces country/customCountry, but not "international needs
     a nationality" — check it here so we never write a blank nationality. */
  const validate = (): Record<string, string> => {
    if (!isParticipant) return {};
    const resolved = resolveCountryForSubmit(form.country, form.customCountry);
    if (!form.country.trim()) return { country: "Required" };
    if (isOtherCountrySelected && !form.customCountry.trim()) {
      return { customCountry: "Please enter the country" };
    }
    if (isInternationalParticipant(resolved) && !form.nationality.trim()) {
      return { nationality: "Required" };
    }
    return {};
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalid = validate();
    if (Object.keys(invalid).length > 0) {
      setErrors(invalid);
      return;
    }

    setSaving(true);
    setErrors({});

    const { country, customCountry, nationality, ...account } = form;
    /* Country only applies to participants — staff accounts keep it untouched.
       The server resolves "Other" -> customCountry and forces "Pakistani". */
    const payload = isParticipant
      ? { ...account, country, customCountry, nationality }
      : account;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="grid max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-2">
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

        {isParticipant ? (
          <>
            <Field
              label="Country"
              required
              hint={
                hasNoCountryOnRecord
                  ? "No country was recorded for this participant — select one before saving."
                  : undefined
              }
              error={errors.country}
            >
              <CountrySelect
                className={adminInput}
                value={form.country}
                onChange={handleCountryChange}
                aria-invalid={!!errors.country}
                placeholder={
                  hasNoCountryOnRecord ? "No country on record" : undefined
                }
              />
            </Field>

            {isOtherCountrySelected ? (
              <Field
                label="Specify country"
                required
                hint="Type the country exactly as it should appear on the roster."
                error={errors.customCountry}
              >
                <Input
                  value={form.customCountry}
                  onChange={(e) => set("customCountry", e.target.value)}
                  placeholder="e.g. Kosovo"
                  className={adminInput}
                />
              </Field>
            ) : null}

            {isInternational ? (
              <Field
                label="Nationality"
                required
                hint="Required for international participants."
                error={errors.nationality}
              >
                <Input
                  value={form.nationality}
                  onChange={(e) => set("nationality", e.target.value)}
                  placeholder="e.g. Turkish"
                  className={adminInput}
                />
              </Field>
            ) : null}
          </>
        ) : null}

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

      <div className="space-y-6">
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
    </div>
  );
}
