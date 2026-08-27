"use client";

import { forwardRef, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronsUp,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { CountrySelect } from "@/components/ui/CountrySelect";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnitUpdateSchema } from "@/lib/validations";
import { ARM_OPTIONS } from "@/lib/form-options";
import { NAMED_COUNTRIES } from "@/lib/countries";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { apiErrorMessage, translateApiMessage } from "@/lib/i18n/api-error-i18n";
import { translateUnitName } from "@/lib/i18n/unit-name-i18n";
import { translateUnitOption } from "@/lib/i18n/unit-option-i18n";

type UnitEditValues = z.infer<typeof UnitUpdateSchema>;

type UnitData = {
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
};

export type UnitEditUser = {
  firstName: string;
  lastName: string;
  rank: string;
  /** Country of application — stored on User, seeded by the admin, editable here. */
  country: string | null;
  unit: UnitData | null;
};

/**
 * The order the form reads in, top to bottom. A failed submit walks this to
 * find the first field the participant still has to deal with — `errors` is a
 * plain object, so its key order follows the schema, not the layout, and the
 * two disagree (CO details sit above Unit details on screen).
 */
const FIELD_ORDER = [
  "firstName",
  "lastName",
  "rank",
  "country",
  "coName",
  "coEmail",
  "coPhone",
  "unitType",
  "branch",
  "unitName",
  "arm",
  "secondPocEmail",
  "thirdPocEmail",
  "additionalInfo",
] as const;

/** Input with a muted leading icon — matches the redesigned card fields. */
const IconInput = forwardRef<
  HTMLInputElement,
  { icon: LucideIcon } & React.ComponentProps<"input">
>(({ icon: Icon, ...props }, ref) => (
  <div className="relative">
    <Icon
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden
    />
    <Input ref={ref} className="rounded-lg pl-9" {...props} />
  </div>
));
IconInput.displayName = "IconInput";

export function UnitEditForm({
  user,
  unitNames,
}: {
  user: UnitEditUser;
  unitNames: string[];
}) {
  const unit = user.unit;
  const router = useRouter();
  const { t, locale } = useI18n();
  const u = t.unit;
  const [submitting, setSubmitting] = useState(false);

  /* Localize zod validation messages (from UnitUpdateSchema) to the active
     locale. The schema emits stable English tokens; the two the participant
     actually hits get the unit dictionary's full sentences ("This field is
     required" reads as an instruction where the bare token "Required" reads as
     a label), and anything else falls back to the shared api-error dictionary. */
  const schemaMessage = (message: string) => {
    if (message === "Required") return u.errors.required;
    if (message === "Valid email required") return u.errors.email;
    return translateApiMessage(message, locale);
  };

  const resolver: Resolver<UnitEditValues> = async (
    values,
    context,
    options
  ) => {
    const result = await zodResolver(UnitUpdateSchema)(values, context, options);
    const errs = result.errors as unknown as Record<
      string,
      { message?: string } | undefined
    >;
    for (const key of Object.keys(errs)) {
      const err = errs[key];
      if (err && typeof err.message === "string") {
        err.message = schemaMessage(err.message);
      }
    }
    return result;
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<UnitEditValues>({
    resolver,
    /* Our own handler does the focusing: half these controls are Radix
       triggers or a combobox with no ref for react-hook-form to focus, and
       its instant jump also fights the smooth scroll below. */
    shouldFocusError: false,
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      rank: user.rank,
      country: user.country ?? "",
      unitType: (unit?.unitType as UnitEditValues["unitType"]) ?? "Regular",
      branch: (unit?.branch as UnitEditValues["branch"]) ?? "Army",
      unitName: unit?.unitName ?? "",
      arm: unit?.arm ?? "",
      secondPocEmail: unit?.secondPocEmail ?? "",
      thirdPocEmail: unit?.thirdPocEmail ?? "",
      additionalInfo: unit?.additionalInfo ?? "",
      coName: unit?.coName ?? "",
      coEmail: unit?.coEmail ?? "",
      coPhone: unit?.coPhone ?? "",
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Take the participant to the first field that still needs them: scroll its
   * block into the middle of the viewport and focus the control inside it. Used
   * both for client-side validation failures and for whatever the API rejects,
   * so an error is never left sitting off-screen with only a toast to show for
   * it.
   */
  const goToFirstInvalid = (invalid: readonly string[]) => {
    const target = FIELD_ORDER.find((field) => invalid.includes(field));
    if (!target) return;
    const block = formRef.current?.querySelector<HTMLElement>(
      `[data-field="${target}"]`
    );
    if (!block) return;
    /* `display: contents` blocks have no box of their own, and a Radix select
       renders its trigger as a button — so scroll and focus whatever control is
       actually inside rather than the wrapper. */
    const control = block.querySelector<HTMLElement>(
      "input:not([type='hidden']), textarea, select, button, [tabindex]:not([tabindex='-1'])"
    );
    (control ?? block).scrollIntoView({ behavior: "smooth", block: "center" });
    control?.focus({ preventScroll: true });
  };

  const onSubmit = async (data: UnitEditValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/unit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(t.common.toasts.saveSuccess);
        /* Back to the dashboard so the participant picks the next step from
           the progress panel. `refresh()` first: the panel is server-rendered
           from `unitInfoCompletedAt`, and without dropping the router cache it
           would render the step still outstanding until a hard reload.
           `submitting` deliberately stays true — the navigation is in flight,
           and re-enabling the button invites a double submit. */
        router.refresh();
        router.push("/event/dashboard");
        return;
      }
      const body = await res.json();
      if (body.errors) {
        const fields = Object.keys(body.errors as Record<string, string[]>);
        Object.entries(body.errors as Record<string, string[]>).forEach(
          ([field, messages]) => {
            setError(field as keyof UnitEditValues, {
              message: schemaMessage(messages[0]),
            });
          }
        );
        goToFirstInvalid(fields);
      } else {
        toast.error(apiErrorMessage(body, locale, t.common.toasts.genericError));
      }
    } catch {
      toast.error(t.common.toasts.genericError);
    }
    setSubmitting(false);
  };

  const cardClass =
    "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";
  const bodyGrid =
    "grid grid-cols-1 items-start gap-x-5 gap-y-4 sm:grid-cols-2";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit, (invalid) =>
        goToFirstInvalid(Object.keys(invalid))
      )}
      noValidate
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Personal Details */}
        <section className={cardClass}>
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-transparent px-5 py-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm">
              <User className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="text-[0.95rem] font-bold text-slate-800">
                {u.sections.personalDetails}
              </div>
              <div className="mt-0.5 text-[0.75rem] text-gray-600">
                {u.descriptions.personal}
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className={bodyGrid}>
              <FormField name="firstName" stacked label={u.fields.firstName} required error={errors.firstName?.message}>
                <IconInput icon={User} {...register("firstName")} />
              </FormField>
              <FormField name="lastName" stacked label={u.fields.lastName} required error={errors.lastName?.message}>
                <IconInput icon={User} {...register("lastName")} />
              </FormField>
              <FormField name="rank" stacked label={u.fields.rank} required error={errors.rank?.message}>
                <IconInput icon={ChevronsUp} {...register("rank")} />
              </FormField>
              {/* Country of application lives on User, not Unit — the admin
                  seeds it with the login and the participant confirms it here,
                  which is the first point in the flow they see their own record. */}
              <FormField name="country" stacked label={u.fields.country} required error={errors.country?.message}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Globe
                        className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <CountrySelect
                        value={field.value}
                        onChange={field.onChange}
                        /* No "Other" — this form has no "specify your own"
                           follow-up, so offering it would file the literal
                           string "Other" as the participant's country. */
                        options={NAMED_COUNTRIES}
                        className="rounded-lg pl-9"
                        placeholder={u.placeholders.select}
                        aria-invalid={!!errors.country}
                      />
                    </div>
                  )}
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* CO / 2IC Details */}
        <section className={cardClass}>
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-transparent px-5 py-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-sm">
              <Users className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="text-[0.95rem] font-bold text-slate-800">
                {u.sections.coDetails}
              </div>
              <div className="mt-0.5 text-[0.75rem] text-gray-600">
                {u.descriptions.co}
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 gap-4">
              <FormField name="coName" stacked label={u.fields.coName} required error={errors.coName?.message}>
                <IconInput icon={User} {...register("coName")} />
              </FormField>
              <FormField name="coEmail" stacked label={u.fields.coEmail} required error={errors.coEmail?.message}>
                <IconInput icon={Mail} type="email" {...register("coEmail")} />
              </FormField>
              <FormField name="coPhone" stacked label={u.fields.coPhone} required error={errors.coPhone?.message}>
                <IconInput icon={Phone} {...register("coPhone")} />
              </FormField>
            </div>
          </div>
        </section>
      </div>

      {/* Unit Details (full width) */}
      <section className={cardClass}>
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-transparent px-5 py-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-sm">
            <Shield className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="text-[0.95rem] font-bold text-slate-800">
              {u.sections.unitDetails}
            </div>
            <div className="mt-0.5 text-[0.75rem] text-gray-600">
              {u.descriptions.unit}
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className={bodyGrid}>
            <FormField name="unitType" stacked label={u.fields.unitType} required error={errors.unitType?.message}>
              <RadioGroup
                value={watch("unitType")}
                onValueChange={(v) =>
                  setValue("unitType", v as UnitEditValues["unitType"])
                }
                className="flex flex-wrap gap-4 pt-1.5"
              >
                {(["Regular", "Reserve"] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`unitType-${opt}`} />
                    <label htmlFor={`unitType-${opt}`} className="text-sm">
                      {translateUnitOption(opt, u.options)}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormField>

            <FormField name="branch" stacked label={u.fields.branch} required error={errors.branch?.message}>
              <RadioGroup
                value={watch("branch")}
                onValueChange={(v) =>
                  setValue("branch", v as UnitEditValues["branch"])
                }
                className="flex flex-wrap gap-4 pt-1.5"
              >
                {(["Army", "Navy", "Air Force"] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`branch-${opt}`} />
                    <label htmlFor={`branch-${opt}`} className="text-sm">
                      {translateUnitOption(opt, u.options)}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormField>

            <FormField name="unitName" stacked label={u.fields.unitName} required error={errors.unitName?.message}>
              <Controller
                name="unitName"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder={u.placeholders.selectUnit} />
                    </SelectTrigger>
                    <SelectContent>
                      {unitNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {translateUnitName(name, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField name="arm" stacked label={u.fields.arm} required error={errors.arm?.message}>
              <Controller
                name="arm"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder={u.placeholders.select} />
                    </SelectTrigger>
                    <SelectContent>
                      {ARM_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {translateUnitOption(opt, u.options)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField name="secondPocEmail" stacked label={u.fields.secondPocEmail} error={errors.secondPocEmail?.message}>
              <IconInput icon={Mail} type="email" {...register("secondPocEmail")} />
            </FormField>
            <FormField name="thirdPocEmail" stacked label={u.fields.thirdPocEmail} error={errors.thirdPocEmail?.message}>
              <IconInput icon={Mail} type="email" {...register("thirdPocEmail")} />
            </FormField>
            <FormField name="additionalInfo"
              stacked
              className="sm:col-span-2"
              label={u.fields.additionalInfo}
              error={errors.additionalInfo?.message}
            >
              <div className="relative">
                <MessageSquare
                  className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"
                  aria-hidden
                />
                <Textarea rows={4} className="rounded-lg pl-9" {...register("additionalInfo")} />
              </div>
            </FormField>
          </div>
        </div>
      </section>

      {/* Footer: review note + save */}
      <div className="flex flex-col items-stretch gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 text-[0.8125rem] text-slate-600">
          <ShieldCheck className="h-5 w-5 flex-none text-emerald-600" aria-hidden />
          <span>{u.reviewNote}</span>
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-green-600 to-green-700 px-7 text-[0.8125rem] font-semibold uppercase tracking-wide text-white shadow-sm transition-colors hover:from-green-700 hover:to-green-800"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          {u.actions.saveChanges}
        </Button>
      </div>
    </form>
  );
}
