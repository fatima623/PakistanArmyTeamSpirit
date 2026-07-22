"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import {
  ASSIGNABLE_ROLES,
  PARTICIPANT_ROLE,
  ROLE_LABELS,
} from "@/lib/auth-routes";
import { adminInput } from "@/lib/admin-ui";
import {
  CUSTOM_COUNTRY_OPTION,
  PAKISTAN_COUNTRY,
  isValidCountry,
  resolveCountryForSubmit,
} from "@/lib/countries";
import { isInternationalParticipant } from "@/lib/participant-country";
import { UNIT_NAMES } from "@/lib/units-list";
import { TOAST } from "@/lib/toast";

const GENDERS = ["Male", "Female", "Other"] as const;
const UNIT_TYPES = ["Regular", "Reserve"] as const;
const BRANCHES = ["Army", "Navy", "Air Force"] as const;
const ARMS = ["Combat", "Combat Support", "Combat Service Support"] as const;

export type AdminUserFormValues = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rank: string;
  gender: string;
  role: string;
  country: string | null;
  nationality: string | null;
  unit: {
    unitType: string;
    branch: string;
    unitName: string;
    arm: string;
    secondPocEmail: string | null;
    thirdPocEmail: string | null;
    additionalInfo: string | null;
    coName: string;
    coEmail: string;
    coPhone: string;
  } | null;
};

/**
 * Split a stored country into the two form controls. A country that predates the
 * picker (or was typed via "Other") is not in WORLD_COUNTRIES, so it maps back to
 * Other + custom text rather than being silently dropped; a missing country stays
 * unselected — we must not invent one for participants whose country was never
 * captured.
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
      <label>
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
        <p className="mt-[0.35rem] text-[0.75rem] font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared card shell for each labelled section (matches the ticker form). */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
      <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
        <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">
          {title}
        </h3>
      </div>
      <div className="flex flex-col gap-[0.85rem] px-[1.1rem] pb-4 pt-[0.9rem]">
        {children}
      </div>
    </section>
  );
}

export function AdminUserForm({
  mode,
  user,
}: {
  mode: "create" | "edit";
  user?: AdminUserFormValues;
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const seeded = isEdit
    ? seedCountryFields(user?.country)
    : { country: PAKISTAN_COUNTRY, customCountry: "" };

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    rank: user?.rank ?? "",
    gender: GENDERS.includes(user?.gender as (typeof GENDERS)[number])
      ? (user!.gender as string)
      : "Other",
    role: user?.role ?? PARTICIPANT_ROLE,
    password: "",
    country: seeded.country,
    customCountry: seeded.customCountry,
    nationality: isEdit ? (user?.nationality ?? "") : "Pakistani",
    // Unit / participant fields
    unitType: user?.unit?.unitType ?? "Regular",
    branch: user?.unit?.branch ?? "Army",
    unitName: user?.unit?.unitName ?? "",
    arm: user?.unit?.arm ?? "",
    secondPocEmail: user?.unit?.secondPocEmail ?? "",
    thirdPocEmail: user?.unit?.thirdPocEmail ?? "",
    additionalInfo: user?.unit?.additionalInfo ?? "",
    coName: user?.unit?.coName ?? "",
    coEmail: user?.unit?.coEmail ?? "",
    coPhone: user?.unit?.coPhone ?? "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isParticipant = form.role === PARTICIPANT_ROLE;
  const isOtherCountry = form.country === CUSTOM_COUNTRY_OPTION;
  const isInternational = isInternationalParticipant(form.country);
  const hasNoCountryOnRecord = isEdit && !user?.country?.trim();

  /* Same rules as public registration: Pakistan implies Pakistani nationality
     and hides the custom-country box; leaving Pakistan clears the auto-filled
     nationality but keeps one that was typed by hand. */
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

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.rank.trim()) e.rank = "Required";
    if (!isEdit && !form.password.trim()) e.password = "Required";
    if (isParticipant) {
      if (!form.country.trim()) e.country = "Required";
      else if (isOtherCountry && !form.customCountry.trim()) {
        e.customCountry = "Please enter the country";
      }
      const resolved = resolveCountryForSubmit(form.country, form.customCountry);
      if (isInternationalParticipant(resolved) && !form.nationality.trim()) {
        e.nationality = "Required";
      }
      if (!form.unitName.trim()) e.unitName = "Required";
      if (!form.arm.trim()) e.arm = "Required";
      if (!form.coName.trim()) e.coName = "Required";
      if (!form.coEmail.trim()) e.coEmail = "Required";
      if (!form.coPhone.trim()) e.coPhone = "Required";
    }
    return e;
  };

  const buildPayload = () => {
    const base: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      rank: form.rank,
      gender: form.gender,
      role: form.role,
    };
    if (!isParticipant) return base;
    return {
      ...base,
      country: form.country,
      customCountry: form.customCountry,
      nationality: form.nationality,
      unitType: form.unitType,
      branch: form.branch,
      unitName: form.unitName,
      arm: form.arm,
      secondPocEmail: form.secondPocEmail,
      thirdPocEmail: form.thirdPocEmail,
      additionalInfo: form.additionalInfo,
      coName: form.coName,
      coEmail: form.coEmail,
      coPhone: form.coPhone,
    };
  };

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
    const invalid = validate();
    if (Object.keys(invalid).length > 0) {
      setErrors(invalid);
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      const payload = isEdit
        ? buildPayload()
        : { ...buildPayload(), password: form.password };
      const res = await fetch(
        isEdit ? `/api/admin/users/${user!.id}` : "/api/admin/users",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        if (isEdit) {
          toast.success("Account updated");
          router.refresh();
        } else {
          const { user: created } = await res.json();
          toast.success("User created");
          router.push(`/admin/users/${created.id}`);
        }
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
    if (!user) return;
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
    <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-[0.85rem] pb-8">
      <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[14px] border border-brand-line/60 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        <div className="min-w-0 flex-[1_1_16rem]">
          <Link
            href="/admin/user-management"
            className="mb-1.5 inline-flex items-center text-[0.78rem] font-medium text-muted-foreground no-underline transition-colors hover:text-green-800"
          >
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            Back to user management
          </Link>
          <h1 className="m-0 text-[1.375rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-brand-ink">
            {isEdit ? "Edit user" : "Create user"}
          </h1>
          <p className="mt-1 text-[0.8rem] leading-[1.4] text-muted-foreground">
            {isParticipant
              ? "Participant account — capture the full registration details below."
              : "Back-office team member (SD / MT / Admin)."}
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[0.85rem]">
        <Section title="Account details">
          <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
            <Field label="First name" required error={errors.firstName}>
              <Input
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                className={adminInput}
              />
            </Field>
            <Field label="Last name" required error={errors.lastName}>
              <Input
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className={adminInput}
              />
            </Field>
          </div>

          <Field label="Email" required error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={adminInput}
            />
          </Field>

          <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
            <Field label="Rank" required error={errors.rank}>
              <Input
                value={form.rank}
                onChange={(e) => set("rank", e.target.value)}
                placeholder="e.g. Capt"
                className={adminInput}
              />
            </Field>
            <Field label="Gender" error={errors.gender}>
              <Select
                value={form.gender}
                onValueChange={(v) => set("gender", v)}
              >
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

          <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
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
            {!isEdit ? (
              <Field
                label="Temporary password"
                required
                error={errors.password}
              >
                <Input
                  type="text"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min 8 chars, mixed case + number"
                  className={adminInput}
                />
              </Field>
            ) : null}
          </div>
        </Section>

        {isParticipant ? (
          <>
            <Section title="Unit details">
              <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
                <Field label="Unit type" required error={errors.unitType}>
                  <select
                    value={form.unitType}
                    onChange={(e) => set("unitType", e.target.value)}
                    className={adminInput}
                  >
                    {UNIT_TYPES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Branch" required error={errors.branch}>
                  <select
                    value={form.branch}
                    onChange={(e) => set("branch", e.target.value)}
                    className={adminInput}
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
                <Field label="Unit name" required error={errors.unitName}>
                  <select
                    value={form.unitName}
                    onChange={(e) => set("unitName", e.target.value)}
                    className={adminInput}
                  >
                    <option value="">Select a unit…</option>
                    {UNIT_NAMES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Arm" required error={errors.arm}>
                  <select
                    value={form.arm}
                    onChange={(e) => set("arm", e.target.value)}
                    className={adminInput}
                  >
                    <option value="">Select an arm…</option>
                    {ARMS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
                <Field label="Country" required error={errors.country}>
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
                {isOtherCountry ? (
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
              </div>

              <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
                <Field label="2nd POC email" error={errors.secondPocEmail}>
                  <Input
                    type="email"
                    value={form.secondPocEmail}
                    onChange={(e) => set("secondPocEmail", e.target.value)}
                    className={adminInput}
                  />
                </Field>
                <Field label="3rd POC email" error={errors.thirdPocEmail}>
                  <Input
                    type="email"
                    value={form.thirdPocEmail}
                    onChange={(e) => set("thirdPocEmail", e.target.value)}
                    className={adminInput}
                  />
                </Field>
              </div>

              <Field label="Additional info" error={errors.additionalInfo}>
                <Textarea
                  value={form.additionalInfo}
                  onChange={(e) => set("additionalInfo", e.target.value)}
                  className={adminInput}
                  rows={3}
                  placeholder="Anything else the organisers should know (optional)."
                />
              </Field>
            </Section>

            <Section title="Detail of Defence Attaché (CO)">
              <Field label="CO name" required error={errors.coName}>
                <Input
                  value={form.coName}
                  onChange={(e) => set("coName", e.target.value)}
                  className={adminInput}
                />
              </Field>
              <div className="grid grid-cols-1 gap-[0.85rem] sm:grid-cols-2">
                <Field label="CO email" required error={errors.coEmail}>
                  <Input
                    type="email"
                    value={form.coEmail}
                    onChange={(e) => set("coEmail", e.target.value)}
                    className={adminInput}
                  />
                </Field>
                <Field label="CO phone" required error={errors.coPhone}>
                  <Input
                    value={form.coPhone}
                    onChange={(e) => set("coPhone", e.target.value)}
                    className={adminInput}
                  />
                </Field>
              </div>
            </Section>
          </>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 pt-1">
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
            {isEdit ? "Save changes" : "Create user"}
          </Button>
        </div>
      </form>

      {isEdit ? (
        <>
          <Section title="Reset password">
            <p className="-mt-1 text-[0.8rem] leading-[1.4] text-muted-foreground">
              Set a new temporary password for this account.
            </p>
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
          </Section>

          <Section title="Delete account">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="m-0 text-[0.8rem] leading-[1.4] text-muted-foreground">
                Permanently remove this user and their data.
              </p>
              {user ? <DeleteUserButton userId={user.id} /> : null}
            </div>
          </Section>
        </>
      ) : null}
    </div>
  );
}
