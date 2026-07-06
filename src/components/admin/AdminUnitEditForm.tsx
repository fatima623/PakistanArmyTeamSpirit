"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { FormFieldAdmin } from "@/components/admin/FormFieldAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminUnitUpdateSchema } from "@/lib/validations";
import {
  ARM_OPTIONS,
  BDE_OR_FMN_OPTIONS,
  DIV_OR_FMN_OPTIONS,
  SERVICE_OPTIONS,
} from "@/lib/form-options";
import { TOAST } from "@/lib/toast";

type FormValues = z.infer<typeof AdminUnitUpdateSchema>;

export type AdminUnitData = {
  id: string;
  preferredPhase: string | null;
  patrolsRequested: number;
  canAccommodateIntl: boolean;
  preferredIntlPatrol: string | null;
  longStandingRelation: boolean;
  unitType: string;
  jointPatrol: boolean;
  branch: string;
  unitName: string;
  bdeOrFmn: string;
  divOrFmn: string;
  arm: string;
  service: string;
  unitAddress: string;
  postcode: string;
  telephoneMil: string;
  telephoneCiv: string;
  secondPocEmail: string | null;
  thirdPocEmail: string | null;
  additionalInfo: string | null;
  coName: string;
  coEmail: string;
  coPhone: string;
  coRank: string;
  coSalutations: string | null;
  user: {
    firstName: string;
    lastName: string;
    rank: string;
  };
};

export function AdminUnitEditForm({ unit }: { unit: AdminUnitData }) {
  const router = useRouter();
  const [unitNames, setUnitNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(AdminUnitUpdateSchema),
    defaultValues: {
      firstName: unit.user.firstName,
      lastName: unit.user.lastName,
      rank: unit.user.rank,
      unitType: unit.unitType as FormValues["unitType"],
      jointPatrol: unit.jointPatrol,
      branch: unit.branch as FormValues["branch"],
      unitName: unit.unitName,
      bdeOrFmn: unit.bdeOrFmn,
      divOrFmn: unit.divOrFmn,
      arm: unit.arm,
      service: unit.service,
      unitAddress: unit.unitAddress,
      postcode: unit.postcode,
      telephoneMil: unit.telephoneMil,
      telephoneCiv: unit.telephoneCiv,
      secondPocEmail: unit.secondPocEmail ?? "",
      thirdPocEmail: unit.thirdPocEmail ?? "",
      additionalInfo: unit.additionalInfo ?? "",
      coName: unit.coName,
      coEmail: unit.coEmail,
      coPhone: unit.coPhone,
      coRank: unit.coRank,
      coSalutations: unit.coSalutations ?? "",
      preferredPhase: unit.preferredPhase,
      patrolsRequested: unit.patrolsRequested,
      canAccommodateIntl: unit.canAccommodateIntl,
      preferredIntlPatrol: unit.preferredIntlPatrol ?? "",
      longStandingRelation: unit.longStandingRelation,
    },
  });

  useEffect(() => {
    fetch("/api/units-list")
      .then((r) => r.json())
      .then((data) => setUnitNames(Array.isArray(data) ? data : []))
      .catch(() => setUnitNames([]));
  }, []);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/units/${unit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          preferredPhase: data.preferredPhase || null,
          preferredIntlPatrol: data.preferredIntlPatrol || null,
        }),
      });
      if (res.ok) {
        toast.success(TOAST.SAVE_SUCCESS);
        router.push("/admin/units");
        router.refresh();
        return;
      }
      const body = await res.json();
      if (body.errors) {
        Object.entries(body.errors as Record<string, string[]>).forEach(
          ([field, messages]) => {
            setError(field as keyof FormValues, { message: messages[0] });
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

  const section = "admin-surface p-6 mb-6 space-y-4";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
      <div className={section}>
        <h2 className="admin-section-title border-b border-cp-border pb-3">
          Personal details
        </h2>
        <FormFieldAdmin label="First name" required error={errors.firstName?.message}>
          <Input className="admin-input" {...register("firstName")} />
        </FormFieldAdmin>
        <FormFieldAdmin label="Last name" required error={errors.lastName?.message}>
          <Input className="admin-input" {...register("lastName")} />
        </FormFieldAdmin>
        <FormFieldAdmin label="Rank" required error={errors.rank?.message}>
          <Input className="admin-input" {...register("rank")} />
        </FormFieldAdmin>
      </div>

      <div className={section}>
        <h2 className="admin-section-title border-b border-cp-border pb-3">
          Unit details
        </h2>
        <FormFieldAdmin label="Unit type" required error={errors.unitType?.message}>
          <RadioGroup
            value={watch("unitType")}
            onValueChange={(v) => setValue("unitType", v as FormValues["unitType"])}
            className="flex flex-wrap gap-4"
          >
            {(["Regular", "Reserve", "UOTC", "International"] as const).map((opt) => (
              <div key={opt} className="flex items-center gap-2 text-cp-ink">
                <RadioGroupItem value={opt} id={`a-unitType-${opt}`} />
                <label htmlFor={`a-unitType-${opt}`}>{opt}</label>
              </div>
            ))}
          </RadioGroup>
        </FormFieldAdmin>
        <FormFieldAdmin label="Unit name" required error={errors.unitName?.message}>
          <Select value={watch("unitName")} onValueChange={(v) => setValue("unitName", v)}>
            <SelectTrigger className="admin-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitNames.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldAdmin>
        <FormFieldAdmin label="Bde / Fmn" required error={errors.bdeOrFmn?.message}>
          <Select value={watch("bdeOrFmn")} onValueChange={(v) => setValue("bdeOrFmn", v)}>
            <SelectTrigger className="admin-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BDE_OR_FMN_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldAdmin>
        <FormFieldAdmin label="Div / Fmn" required error={errors.divOrFmn?.message}>
          <Select value={watch("divOrFmn")} onValueChange={(v) => setValue("divOrFmn", v)}>
            <SelectTrigger className="admin-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIV_OR_FMN_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldAdmin>
        <FormFieldAdmin label="Arm" required error={errors.arm?.message}>
          <Select value={watch("arm")} onValueChange={(v) => setValue("arm", v)}>
            <SelectTrigger className="admin-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARM_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldAdmin>
        <FormFieldAdmin label="Service" required error={errors.service?.message}>
          <Select value={watch("service")} onValueChange={(v) => setValue("service", v)}>
            <SelectTrigger className="admin-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldAdmin>
        <FormFieldAdmin label="Unit address" required error={errors.unitAddress?.message}>
          <Input className="admin-input" {...register("unitAddress")} />
        </FormFieldAdmin>
        <FormFieldAdmin label="Postcode" required error={errors.postcode?.message}>
          <Input className="admin-input" {...register("postcode")} />
        </FormFieldAdmin>
        <FormFieldAdmin label="Telephone (mil)" required error={errors.telephoneMil?.message}>
          <Input className="admin-input" {...register("telephoneMil")} />
        </FormFieldAdmin>
        <FormFieldAdmin label="Telephone (civ)" required error={errors.telephoneCiv?.message}>
          <Input className="admin-input" {...register("telephoneCiv")} />
        </FormFieldAdmin>
        <FormFieldAdmin label="CO name" required error={errors.coName?.message}>
          <Input className="admin-input" {...register("coName")} />
        </FormFieldAdmin>
        <FormFieldAdmin label="CO email" required error={errors.coEmail?.message}>
          <Input type="email" className="admin-input" {...register("coEmail")} />
        </FormFieldAdmin>
      </div>

      <div className={section}>
        <h2 className="admin-section-title border-b border-cp-border pb-3">
          Hosting (admin)
        </h2>
        <FormFieldAdmin label="Preferred phase" error={errors.preferredPhase?.message}>
          <Input
            className="admin-input"
            placeholder="e.g. Phase 1"
            value={watch("preferredPhase") ?? ""}
            onChange={(e) =>
              setValue("preferredPhase", e.target.value.trim() || null)
            }
          />
        </FormFieldAdmin>
        <FormFieldAdmin label="Patrols requested" error={errors.patrolsRequested?.message}>
          <Input
            type="number"
            min={1}
            className="w-32 admin-input"
            {...register("patrolsRequested", { valueAsNumber: true })}
          />
        </FormFieldAdmin>
        <FormFieldAdmin label="Can accommodate international">
          <RadioGroup
            value={watch("canAccommodateIntl") ? "true" : "false"}
            onValueChange={(v) => setValue("canAccommodateIntl", v === "true")}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2 text-cp-ink">
              <RadioGroupItem value="true" id="intl-yes" />
              <label htmlFor="intl-yes">Yes</label>
            </div>
            <div className="flex items-center gap-2 text-cp-ink">
              <RadioGroupItem value="false" id="intl-no" />
              <label htmlFor="intl-no">No</label>
            </div>
          </RadioGroup>
        </FormFieldAdmin>
        <FormFieldAdmin label="Preferred international patrol">
          <Input className="admin-input" {...register("preferredIntlPatrol")} />
        </FormFieldAdmin>
        <FormFieldAdmin label="Long-standing relationship">
          <RadioGroup
            value={watch("longStandingRelation") ? "true" : "false"}
            onValueChange={(v) => setValue("longStandingRelation", v === "true")}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2 text-cp-ink">
              <RadioGroupItem value="true" id="lsr-yes" />
              <label htmlFor="lsr-yes">Yes</label>
            </div>
            <div className="flex items-center gap-2 text-cp-ink">
              <RadioGroupItem value="false" id="lsr-no" />
              <label htmlFor="lsr-no">No</label>
            </div>
          </RadioGroup>
        </FormFieldAdmin>
      </div>

      <Button type="submit" disabled={submitting} variant="adminPrimary">
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
