"use client";

import { forwardRef, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronsUp,
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
  unit: UnitData | null;
};

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
  const { t, locale } = useI18n();
  const u = t.unit;
  const [submitting, setSubmitting] = useState(false);

  // Localize zod validation messages (from UnitUpdateSchema) to the active
  // locale via the shared api-error dictionary.
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
        err.message = translateApiMessage(err.message, locale);
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
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      rank: user.rank,
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
        return;
      }
      const body = await res.json();
      if (body.errors) {
        Object.entries(body.errors as Record<string, string[]>).forEach(
          ([field, messages]) => {
            setError(field as keyof UnitEditValues, {
              message: translateApiMessage(messages[0], locale),
            });
          }
        );
      } else {
        toast.error(apiErrorMessage(body, locale, t.common.toasts.genericError));
      }
    } catch {
      toast.error(t.common.toasts.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const cardClass =
    "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";
  const bodyGrid =
    "grid grid-cols-1 items-start gap-x-5 gap-y-4 sm:grid-cols-2";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <FormField stacked label={u.fields.firstName} required error={errors.firstName?.message}>
                <IconInput icon={User} {...register("firstName")} />
              </FormField>
              <FormField stacked label={u.fields.lastName} required error={errors.lastName?.message}>
                <IconInput icon={User} {...register("lastName")} />
              </FormField>
              <FormField stacked className="sm:col-span-2" label={u.fields.rank} required error={errors.rank?.message}>
                <IconInput icon={ChevronsUp} {...register("rank")} />
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
              <FormField stacked label={u.fields.coName} required error={errors.coName?.message}>
                <IconInput icon={User} {...register("coName")} />
              </FormField>
              <FormField stacked label={u.fields.coEmail} required error={errors.coEmail?.message}>
                <IconInput icon={Mail} type="email" {...register("coEmail")} />
              </FormField>
              <FormField stacked label={u.fields.coPhone} required error={errors.coPhone?.message}>
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
            <div className="mt-0.5 text-[0.75rem] text-slate-500">
              {u.descriptions.unit}
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className={bodyGrid}>
            <FormField stacked label={u.fields.unitType} required error={errors.unitType?.message}>
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

            <FormField stacked label={u.fields.branch} required error={errors.branch?.message}>
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

            <FormField stacked label={u.fields.unitName} required error={errors.unitName?.message}>
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

            <FormField stacked label={u.fields.arm} required error={errors.arm?.message}>
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

            <FormField stacked label={u.fields.secondPocEmail} error={errors.secondPocEmail?.message}>
              <IconInput icon={Mail} type="email" {...register("secondPocEmail")} />
            </FormField>
            <FormField stacked label={u.fields.thirdPocEmail} error={errors.thirdPocEmail?.message}>
              <IconInput icon={Mail} type="email" {...register("thirdPocEmail")} />
            </FormField>
            <FormField
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
