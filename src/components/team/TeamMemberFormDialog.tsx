"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TeamMemberSchema, type TeamMemberInput } from "@/lib/validations";

const GENDERS = ["Male", "Female", "Other"] as const;

const EMPTY: TeamMemberInput = {
  fullName: "",
  serviceNumber: "",
  rank: "",
  serviceArm: "",
  gender: "Male",
};

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-brand-ink">
        {label} <span className="text-brand-red">*</span>
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TeamMemberFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Persist the member. Throw / reject to keep the dialog open on failure. */
  onSubmit: (values: TeamMemberInput) => Promise<void>;
}) {
  const [form, setForm] = useState<TeamMemberInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset to a clean form each time the dialog is opened.
  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const set = (key: keyof TeamMemberInput, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = TeamMemberSchema.safeParse(form);
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v && v[0]) flat[k] = v[0];
      }
      setErrors(flat);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit(parsed.data);
      onOpenChange(false);
    } catch {
      // Caller surfaces the error (toast); keep the dialog open to retry.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-brand-line bg-white text-brand-ink shadow-[0_8px_30px_rgba(28,33,25,0.12)]">
        <DialogHeader>
          <DialogTitle className="text-brand-ink">Add team member</DialogTitle>
          <DialogDescription className="text-brand-ink-muted">
            Add a member participating in the event. You can edit your team at any
            time from the Participant Panel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name" htmlFor="tm-fullName" error={errors.fullName}>
            <Input
              id="tm-fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. Capt Sara Khan"
              autoFocus
            />
          </Field>

          <Field
            label="Serial number"
            htmlFor="tm-serviceNumber"
            error={errors.serviceNumber}
          >
            <Input
              id="tm-serviceNumber"
              value={form.serviceNumber}
              onChange={(e) => set("serviceNumber", e.target.value)}
              placeholder="e.g. PA-123456"
            />
          </Field>

          <Field label="Rank" htmlFor="tm-rank" error={errors.rank}>
            <Input
              id="tm-rank"
              value={form.rank}
              onChange={(e) => set("rank", e.target.value)}
              placeholder="e.g. Captain"
            />
          </Field>

          <Field
            label="Service / Arm"
            htmlFor="tm-serviceArm"
            error={errors.serviceArm}
          >
            <Input
              id="tm-serviceArm"
              value={form.serviceArm}
              onChange={(e) => set("serviceArm", e.target.value)}
              placeholder="e.g. Infantry, Signals, RA"
            />
          </Field>

          <Field label="Gender" error={errors.gender}>
            <RadioGroup
              value={form.gender}
              onValueChange={(v) => set("gender", v)}
              className="flex flex-wrap gap-4"
            >
              {GENDERS.map((g) => (
                <div key={g} className="flex items-center gap-2">
                  <RadioGroupItem value={g} id={`tm-gender-${g}`} />
                  <Label
                    htmlFor={`tm-gender-${g}`}
                    className="font-normal text-brand-ink"
                  >
                    {g}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
