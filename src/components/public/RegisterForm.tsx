"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RegisterSchema } from "@/lib/validations";
import type { z } from "zod";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TOAST } from "@/lib/toast";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/branding";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  CUSTOM_COUNTRY_OPTION,
  PAKISTAN_COUNTRY,
  resolveCountryForSubmit,
} from "@/lib/countries";
import { UNIT_NAMES } from "@/lib/units-list";
import { CountrySelect } from "@/components/ui/CountrySelect";

type RegisterFormValues = z.infer<typeof RegisterSchema>;

const ARM_OPTIONS = [
  "Combat",
  "Combat Support",
  "Combat Service Support",
] as const;

type RegisterFormProps = {
  initialIntlRegistrationOpen: boolean;
};

export function RegisterForm({
  initialIntlRegistrationOpen,
}: RegisterFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      gender: "Male",
      unitType: "Regular",
      branch: "Army",
      country: PAKISTAN_COUNTRY,
    },
  });

  const selectedCountry = watch("country");
  const isPakistanSelected = selectedCountry === PAKISTAN_COUNTRY;
  const isOtherCountrySelected = selectedCountry === CUSTOM_COUNTRY_OPTION;

  useEffect(() => {
    if (isPakistanSelected) {
      setValue("nationality", "Pakistani");
      setValue("customCountry", "");
    } else {
      setValue("nationality", "");
    }
    if (!isOtherCountrySelected) {
      setValue("customCountry", "");
    }
  }, [isPakistanSelected, isOtherCountrySelected, setValue]);

  useEffect(() => {
    fetch("/api/auth/csrf-token")
      .then((res) => res.json())
      .then((data: { csrfToken?: string }) => setCsrfToken(data.csrfToken ?? ""))
      .catch(() => setCsrfToken(""));
  }, []);

  const onSubmit = async (data: RegisterFormValues) => {
    if (!csrfToken) {
      toast.error(t.register.errors.csrf);
      return;
    }

    const country = resolveCountryForSubmit(data.country, data.customCountry);
    const payload = {
      ...data,
      country,
      nationality:
        country === PAKISTAN_COUNTRY ? "Pakistani" : data.nationality?.trim(),
      csrfToken,
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/event/login?registered=true");
      return;
    }

    const body = await res.json();
    if (body.errors) {
      Object.entries(body.errors as Record<string, string[]>).forEach(
        ([field, messages]) => {
          setError(field as keyof RegisterFormValues, {
            message: messages[0],
          });
        }
      );
    } else {
      toast.error(body.error ?? TOAST.GENERIC_ERROR);
    }
  };

  const sectionClass = "pats-form-section";
  // Two related fields per row on desktop/laptop (>=1024px); collapses to a
  // single column on tablet and mobile. Each FormField is `stacked` so it fills
  // a single grid cell.
  const gridClass = "grid grid-cols-1 items-start gap-x-6 gap-y-5 lg:grid-cols-2";

  return (
    <div className="pats-form-page">
      <div className="pats-form-notice space-y-2">
        <p>
          {t.register.notice.intro(SITE_NAME)}{" "}
          <strong>{t.register.notice.emphasis}</strong>{" "}
          {t.register.notice.rest}
        </p>
        <p>{t.register.notice.phaseNote}</p>
        {!initialIntlRegistrationOpen && (
          <p className="pats-form-notice--warn">
            {t.register.notice.intlClosedPrefix}{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            {t.register.notice.intlClosedSuffix}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
        <div className={sectionClass}>
          <h2 className="pats-form-section-title">
            {t.register.sections.account}
          </h2>
          <div className={gridClass}>
            <FormField
              stacked
              className="lg:col-span-2"
              label={t.register.fields.email}
              required
              error={errors.email?.message}
            >
              <Input type="email" autoComplete="email" {...register("email")} />
            </FormField>
            <FormField stacked
              label={t.register.fields.password}
              required
              hint={t.register.fields.passwordHint}
              error={errors.password?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
            </FormField>
            <FormField stacked
              label={t.register.fields.confirmPassword}
              required
              error={errors.confirmPassword?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </FormField>
            <FormField stacked label={t.register.fields.firstName} required error={errors.firstName?.message}>
              <Input {...register("firstName")} />
            </FormField>
            <FormField stacked label={t.register.fields.lastName} required error={errors.lastName?.message}>
              <Input {...register("lastName")} />
            </FormField>
            <FormField stacked label={t.register.fields.rank} required error={errors.rank?.message}>
              <Input {...register("rank")} />
            </FormField>
            <FormField stacked label={t.register.fields.gender} required error={errors.gender?.message}>
              <RadioGroup
                value={watch("gender")}
                onValueChange={(v) =>
                  setValue("gender", v as RegisterFormValues["gender"])
                }
                className="flex flex-wrap gap-4"
              >
                {(["Male", "Female", "Other"] as const).map((g) => (
                  <div key={g} className="flex items-center gap-2">
                    <RadioGroupItem value={g} id={`gender-${g}`} />
                    <Label htmlFor={`gender-${g}`} className="font-normal">
                      {t.register.options.gender[g]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormField>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="pats-form-section-title">
            {t.register.sections.unit}
          </h2>
          <div className={gridClass}>
            <FormField stacked label={t.register.fields.unitType} required error={errors.unitType?.message}>
              <RadioGroup
                value={watch("unitType")}
                onValueChange={(v) =>
                  setValue("unitType", v as RegisterFormValues["unitType"])
                }
                className="flex flex-wrap gap-4"
              >
                {(["Regular", "Reserve"] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`unitType-${opt}`} />
                    <Label htmlFor={`unitType-${opt}`} className="font-normal">
                      {t.register.options.unitType[opt]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormField>
            <FormField stacked label={t.register.fields.branch} required error={errors.branch?.message}>
              <RadioGroup
                value={watch("branch")}
                onValueChange={(v) =>
                  setValue("branch", v as RegisterFormValues["branch"])
                }
                className="flex flex-wrap gap-4"
              >
                {(["Army", "Navy", "Air Force"] as const).map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <RadioGroupItem value={b} id={`branch-${b}`} />
                    <Label htmlFor={`branch-${b}`} className="font-normal">
                      {t.register.options.branch[b]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormField>
            <FormField stacked label={t.register.fields.unitName} required error={errors.unitName?.message}>
              <Controller
                name="unitName"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.register.fields.selectUnit} />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField stacked
              label={t.register.fields.country}
              required
              error={errors.country?.message}
            >
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <CountrySelect
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={!!errors.country}
                  />
                )}
              />
            </FormField>
            {isOtherCountrySelected ? (
              <FormField stacked
                label={t.register.fields.specifyCountry}
                required
                hint={t.register.fields.specifyCountryHint}
                error={errors.customCountry?.message}
              >
                <Input
                  {...register("customCountry")}
                  placeholder={t.register.fields.specifyCountryPlaceholder}
                />
              </FormField>
            ) : null}
            {!isPakistanSelected ? (
              <FormField stacked
                label={t.register.fields.nationality}
                required
                hint={t.register.fields.nationalityHint}
                error={errors.nationality?.message}
              >
                <Input
                  {...register("nationality")}
                  placeholder={t.register.fields.nationalityPlaceholder}
                />
              </FormField>
            ) : null}
            <FormField stacked label={t.register.fields.arm} required error={errors.arm?.message}>
              <Controller
                name="arm"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.register.fields.select} />
                    </SelectTrigger>
                    <SelectContent>
                      {ARM_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {t.register.options.arm[o]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField stacked
              label={t.register.fields.secondPoc}
              error={errors.secondPocEmail?.message}
            >
              <Input type="email" {...register("secondPocEmail")} />
            </FormField>
            <FormField stacked
              label={t.register.fields.thirdPoc}
              error={errors.thirdPocEmail?.message}
            >
              <Input type="email" {...register("thirdPocEmail")} />
            </FormField>
            <FormField stacked
              className="lg:col-span-2"
              label={t.register.fields.additionalInfo}
              error={errors.additionalInfo?.message}
            >
              <Textarea rows={4} {...register("additionalInfo")} />
            </FormField>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="pats-form-section-title">
            {t.register.sections.attache}
          </h2>
          <div className={gridClass}>
            <FormField stacked label={t.register.fields.coName} required error={errors.coName?.message}>
              <Input {...register("coName")} />
            </FormField>
            <FormField stacked label={t.register.fields.coEmail} required error={errors.coEmail?.message}>
              <Input type="email" {...register("coEmail")} />
            </FormField>
            <FormField stacked label={t.register.fields.coPhone} required error={errors.coPhone?.message}>
              <Input {...register("coPhone")} />
            </FormField>
          </div>
        </div>

        <div className={sectionClass}>
          <div className="flex items-start gap-3">
            <Controller
              name="privacyAccepted"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="privacyAccepted"
                  checked={field.value === true}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true ? true : undefined)
                  }
                />
              )}
            />
            <label
              htmlFor="privacyAccepted"
              className="pats-form-choice cursor-pointer"
            >
              {t.register.consent.prefix}{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-olive hover:underline"
              >
                {t.register.consent.link}
              </Link>
            </label>
          </div>
          {errors.privacyAccepted && (
            <p className="mt-2 text-xs text-red-500">
              {errors.privacyAccepted.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !csrfToken}
            className="pats-btn pats-btn--gold mt-6 h-auto min-h-[2.75rem] px-8"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.register.submitting}
              </span>
            ) : (
              t.register.submit
            )}
          </Button>
          <p className="mt-4 text-sm text-slate-500">
            {t.register.afterSubmit}
          </p>
        </div>
      </form>
    </div>
  );
}