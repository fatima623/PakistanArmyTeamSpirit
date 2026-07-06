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
import {
  CUSTOM_COUNTRY_OPTION,
  PAKISTAN_COUNTRY,
  resolveCountryForSubmit,
} from "@/lib/countries";
import { UNIT_NAMES } from "@/lib/units-list";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { TeamMembersSection } from "@/components/team/TeamMembersSection";
import type { TeamMemberInput } from "@/lib/validations";
import type { TeamMemberRecord } from "@/lib/team-members";

type RegisterFormValues = z.infer<typeof RegisterSchema>;

/** Local (pre-registration) team member: same fields plus a client-only id. */
type LocalTeamMember = TeamMemberInput & { id: string };

function makeLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const BDE_OPTIONS = [
  "16 Air Asslt BCT",
  "1 (UK) Div",
  "3 (UK) Div",
  "6 Div",
  "11 (SE) Bde",
  "38 (Irish) Bde",
  "51 (Scottish) Bde",
  "HQ 37 DIV",
  "ARRC",
  "Other",
];

const DIV_OPTIONS = ["CFA", "1 Div", "3 Div", "6 Div", "RN", "RAF", "Other"];

const ARM_OPTIONS = [
  "Combat",
  "Combat Support",
  "Combat Service Support",
];

const SERVICE_OPTIONS = [
  "INF",
  "AAC",
  "RE",
  "RLC",
  "RA",
  "REME",
  "RMP",
  "AGC(SPS)",
  "AGC(ETS)",
  "AGC(RMP)",
  "AMS",
  "QARANC",
  "Int Corps",
  "Sig",
  "Cav",
  "PARA",
  "Gds",
  "RN",
  "RAF",
  "UOTC",
  "Other",
];

function BoolRadio({
  value,
  onChange,
  idPrefix,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  idPrefix: string;
}) {
  return (
    <RadioGroup
      value={value ? "true" : "false"}
      onValueChange={(v) => onChange(v === "true")}
      className="flex flex-wrap gap-4"
    >
      <div className="flex items-center gap-2">
        <RadioGroupItem value="true" id={`${idPrefix}-yes`} />
        <Label htmlFor={`${idPrefix}-yes`} className="pats-form-choice font-normal">
          Yes
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="false" id={`${idPrefix}-no`} />
        <Label htmlFor={`${idPrefix}-no`} className="pats-form-choice font-normal">
          No
        </Label>
      </div>
    </RadioGroup>
  );
}

type RegisterFormProps = {
  initialIntlRegistrationOpen: boolean;
};

export function RegisterForm({
  initialIntlRegistrationOpen,
}: RegisterFormProps) {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");
  const [teamMembers, setTeamMembers] = useState<LocalTeamMember[]>([]);

  const addTeamMember = async (values: TeamMemberInput) => {
    setTeamMembers((prev) => [...prev, { ...values, id: makeLocalId() }]);
  };

  const removeTeamMember = async (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

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
      jointPatrol: false,
      canAccommodateIntl: false,
      longStandingRelation: false,
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
      toast.error("Security check failed. Refresh and try again.");
      return;
    }

    const country = resolveCountryForSubmit(data.country, data.customCountry);
    const payload = {
      ...data,
      country,
      nationality:
        country === PAKISTAN_COUNTRY ? "Pakistani" : data.nationality?.trim(),
      teamMembers: teamMembers.map((member) => ({
        fullName: member.fullName,
        serviceNumber: member.serviceNumber,
        serviceArm: member.serviceArm,
        gender: member.gender,
      })),
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
          Before registering for {SITE_NAME} please{" "}
          <strong>make sure you have all the details below available.</strong>{" "}
          Applications containing incorrect information will be rejected. All
          fields are required unless marked otherwise.
        </p>
        <p>
          Note: phase selection is available in the next stage. Registration is
          not complete until patrols are paid for.
        </p>
        {!initialIntlRegistrationOpen && (
          <p className="pats-form-notice--warn">
            Applications are now closed for International Patrols only. Please
            contact{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            if you require any assistance.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
        <div className={sectionClass}>
          <h2 className="pats-form-section-title">
            Account details
          </h2>
          <div className={gridClass}>
            <FormField
              stacked
              className="lg:col-span-2"
              label="Email"
              required
              error={errors.email?.message}
            >
              <Input type="email" autoComplete="email" {...register("email")} />
            </FormField>
            <FormField stacked
              label="Password"
              required
              hint="Min 8 chars: upper, lower, number, special"
              error={errors.password?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
            </FormField>
            <FormField stacked
              label="Confirm password"
              required
              error={errors.confirmPassword?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </FormField>
            <FormField stacked label="First name" required error={errors.firstName?.message}>
              <Input {...register("firstName")} />
            </FormField>
            <FormField stacked label="Last name" required error={errors.lastName?.message}>
              <Input {...register("lastName")} />
            </FormField>
            <FormField stacked label="Rank" required error={errors.rank?.message}>
              <Input {...register("rank")} />
            </FormField>
            <FormField stacked label="Gender" required error={errors.gender?.message}>
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
                      {g}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormField>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="pats-form-section-title">
            Unit details
          </h2>
          <div className={gridClass}>
            <FormField stacked label="Unit type" required error={errors.unitType?.message}>
              <RadioGroup
                value={watch("unitType")}
                onValueChange={(v) =>
                  setValue("unitType", v as RegisterFormValues["unitType"])
                }
                className="flex flex-wrap gap-4"
              >
                {(["Regular", "Reserve", "UOTC", "International"] as const).map(
                  (t) => (
                    <div key={t} className="flex items-center gap-2">
                      <RadioGroupItem value={t} id={`unitType-${t}`} />
                      <Label htmlFor={`unitType-${t}`} className="font-normal">
                        {t}
                      </Label>
                    </div>
                  )
                )}
              </RadioGroup>
            </FormField>
            <FormField stacked
              label="Joint patrol"
              required
              hint="Definition of a joint patrol: the combination of a Pakistan and international patrol"
              error={errors.jointPatrol?.message}
            >
              <BoolRadio
                idPrefix="jointPatrol"
                value={watch("jointPatrol")}
                onChange={(v) => setValue("jointPatrol", v)}
              />
            </FormField>
            <FormField stacked label="Branch" required error={errors.branch?.message}>
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
                      {b}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormField>
            <FormField stacked label="Unit name" required error={errors.unitName?.message}>
              <Controller
                name="unitName"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
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
              label="Country of Application"
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
                label="Specify country"
                required
                hint="Enter your country if it is not listed above"
                error={errors.customCountry?.message}
              >
                <Input
                  {...register("customCountry")}
                  placeholder="Enter your country"
                />
              </FormField>
            ) : null}
            {!isPakistanSelected ? (
              <FormField stacked
                label="Nationality"
                required
                hint="Required for international participants"
                error={errors.nationality?.message}
              >
                <Input
                  {...register("nationality")}
                  placeholder="e.g. British, Turkish, Jordanian"
                />
              </FormField>
            ) : null}
            <FormField stacked label="Bde / Fmn" required error={errors.bdeOrFmn?.message}>
              <Controller
                name="bdeOrFmn"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {BDE_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField stacked label="Div / Fmn" required error={errors.divOrFmn?.message}>
              <Controller
                name="divOrFmn"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIV_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField stacked label="Arm" required error={errors.arm?.message}>
              <Controller
                name="arm"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {ARM_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField stacked label="Service" required error={errors.service?.message}>
              <Controller
                name="service"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField stacked
              label="Unit address"
              required
              error={errors.unitAddress?.message}
            >
              <Input {...register("unitAddress")} />
            </FormField>
            <FormField stacked label="Postcode" required error={errors.postcode?.message}>
              <Input {...register("postcode")} />
            </FormField>
            <FormField stacked
              label="Telephone (mil)"
              required
              hint="with ATN code"
              error={errors.telephoneMil?.message}
            >
              <Input {...register("telephoneMil")} />
            </FormField>
            <FormField stacked
              label="Telephone (civ)"
              required
              hint="with STD code"
              error={errors.telephoneCiv?.message}
            >
              <Input {...register("telephoneCiv")} />
            </FormField>
            <FormField stacked
              label="2nd POC email"
              error={errors.secondPocEmail?.message}
            >
              <Input type="email" {...register("secondPocEmail")} />
            </FormField>
            <FormField stacked
              label="3rd POC email (optional)"
              error={errors.thirdPocEmail?.message}
            >
              <Input type="email" {...register("thirdPocEmail")} />
            </FormField>
            <FormField stacked
              className="lg:col-span-2"
              label="Additional info (optional)"
              error={errors.additionalInfo?.message}
            >
              <Textarea rows={4} {...register("additionalInfo")} />
            </FormField>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="pats-form-section-title">
            CO / 2IC details
          </h2>
          <div className={gridClass}>
            <FormField stacked label="CO name" required error={errors.coName?.message}>
              <Input {...register("coName")} />
            </FormField>
            <FormField stacked label="CO email" required error={errors.coEmail?.message}>
              <Input type="email" {...register("coEmail")} />
            </FormField>
            <FormField stacked label="CO phone" required error={errors.coPhone?.message}>
              <Input {...register("coPhone")} />
            </FormField>
            <FormField stacked label="CO rank" required error={errors.coRank?.message}>
              <Input {...register("coRank")} />
            </FormField>
            <FormField stacked
              label="CO salutations (optional)"
              error={errors.coSalutations?.message}
            >
              <Input {...register("coSalutations")} />
            </FormField>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="pats-form-section-title">Team Members (optional)</h2>
          <TeamMembersSection
            members={teamMembers as TeamMemberRecord[]}
            onAdd={addTeamMember}
            onDelete={removeTeamMember}
            title="Your team"
            description="Optionally add the members participating in the event. This is not required — you can submit your registration without any team members and manage them later from the Participant Panel."
          />
        </div>

        <div className={sectionClass}>
          <h2 className="pats-form-section-title">
            Hosting
          </h2>
          <p className="mb-4 italic text-cp-ink-muted">
            All Pakistan Army patrols are expected to host an international patrol;
            those that
            are unable to host will be placed on the reserve list until all
            hosting duties have been allocated.
          </p>
          <div className={gridClass}>
            <FormField stacked
              label="Can accommodate international"
              required
              error={errors.canAccommodateIntl?.message}
            >
              <BoolRadio
                idPrefix="canAccommodateIntl"
                value={watch("canAccommodateIntl")}
                onChange={(v) => setValue("canAccommodateIntl", v)}
              />
            </FormField>
            <FormField stacked
              label="Preferred international patrol"
              error={errors.preferredIntlPatrol?.message}
            >
              <Input {...register("preferredIntlPatrol")} />
            </FormField>
            <FormField stacked
              label="Long-standing relationship"
              required
              error={errors.longStandingRelation?.message}
            >
              <BoolRadio
                idPrefix="longStandingRelation"
                value={watch("longStandingRelation")}
                onChange={(v) => setValue("longStandingRelation", v)}
              />
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
              I have read and agree to the{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cp-olive hover:underline"
              >
                privacy policy
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
                Submitting...
              </span>
            ) : (
              "Next stage"
            )}
          </Button>
          <p className="mt-4 text-sm text-slate-500">
            After registering you will receive an email confirmation. Please
            check your Spam/Junk folder in case it ends up there.
          </p>
        </div>
      </form>
    </div>
  );
}