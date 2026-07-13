"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { TOAST } from "@/lib/toast";
import { useI18n } from "@/lib/i18n/I18nProvider";

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

export function UnitEditForm({
  user,
  unitNames,
}: {
  user: UnitEditUser;
  unitNames: string[];
}) {
  const unit = user.unit;
  const { t } = useI18n();
  const u = t.unit;
  const [submitting, setSubmitting] = useState(false);

  const unitTypeLabels: Record<"Regular" | "Reserve", string> = {
    Regular: u.options.regular,
    Reserve: u.options.reserve,
  };
  const branchLabels: Record<"Army" | "Navy" | "Air Force", string> = {
    Army: u.options.army,
    Navy: u.options.navy,
    "Air Force": u.options.airForce,
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
    resolver: zodResolver(UnitUpdateSchema),
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
        toast.success(TOAST.SAVE_SUCCESS);
        return;
      }
      const body = await res.json();
      if (body.errors) {
        Object.entries(body.errors as Record<string, string[]>).forEach(
          ([field, messages]) => {
            setError(field as keyof UnitEditValues, {
              message: messages[0],
            });
          }
        );
      } else {
        toast.error(body.error ?? TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const gridClass =
    "grid grid-cols-1 items-start gap-x-5 gap-y-4 sm:grid-cols-2";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
      <div className="portal-form-card mb-6 rounded-2xl">
        <h2 className="portal-section-title mb-6 border-b border-brand-line pb-3">
          {u.sections.personalDetails}
        </h2>
        <div className={gridClass}>
          <FormField stacked label={u.fields.firstName} required error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </FormField>
          <FormField stacked label={u.fields.lastName} required error={errors.lastName?.message}>
            <Input {...register("lastName")} />
          </FormField>
          <FormField stacked label={u.fields.rank} required error={errors.rank?.message}>
            <Input {...register("rank")} />
          </FormField>
        </div>
      </div>

      <div className="portal-form-card mb-6 rounded-2xl">
        <h2 className="portal-section-title mb-6 border-b border-brand-line pb-3">
          {u.sections.unitDetails}
        </h2>
        <div className={gridClass}>
          <FormField stacked label={u.fields.unitType} required error={errors.unitType?.message}>
            <RadioGroup
              value={watch("unitType")}
              onValueChange={(v) =>
                setValue("unitType", v as UnitEditValues["unitType"])
              }
              className="flex flex-wrap gap-4"
            >
              {(["Regular", "Reserve"] as const).map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem value={opt} id={`unitType-${opt}`} />
                  <label htmlFor={`unitType-${opt}`} className="text-sm">
                    {unitTypeLabels[opt]}
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
              className="flex flex-wrap gap-4"
            >
              {(["Army", "Navy", "Air Force"] as const).map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem value={opt} id={`branch-${opt}`} />
                  <label htmlFor={`branch-${opt}`} className="text-sm">
                    {branchLabels[opt]}
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
                  <SelectTrigger>
                    <SelectValue placeholder={u.placeholders.selectUnit} />
                  </SelectTrigger>
                  <SelectContent>
                    {unitNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
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
                  <SelectTrigger>
                    <SelectValue placeholder={u.placeholders.select} />
                  </SelectTrigger>
                  <SelectContent>
                    {ARM_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField stacked label={u.fields.secondPocEmail} error={errors.secondPocEmail?.message}>
            <Input type="email" {...register("secondPocEmail")} />
          </FormField>
          <FormField
            stacked
            label={u.fields.thirdPocEmail}
            error={errors.thirdPocEmail?.message}
          >
            <Input type="email" {...register("thirdPocEmail")} />
          </FormField>
          <FormField
            stacked
            className="sm:col-span-2"
            label={u.fields.additionalInfo}
            error={errors.additionalInfo?.message}
          >
            <Textarea rows={4} {...register("additionalInfo")} />
          </FormField>
        </div>
      </div>

      <div className="portal-form-card mb-6 rounded-2xl">
        <h2 className="portal-section-title mb-6 border-b border-brand-line pb-3">
          {u.sections.coDetails}
        </h2>
        <div className={gridClass}>
          <FormField stacked label={u.fields.coName} required error={errors.coName?.message}>
            <Input {...register("coName")} />
          </FormField>
          <FormField stacked label={u.fields.coEmail} required error={errors.coEmail?.message}>
            <Input type="email" {...register("coEmail")} />
          </FormField>
          <FormField stacked label={u.fields.coPhone} required error={errors.coPhone?.message}>
            <Input {...register("coPhone")} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitting}
          className="cp-btn-primary px-8"
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {u.actions.saveChanges}
        </Button>
      </div>
    </form>
  );
}
