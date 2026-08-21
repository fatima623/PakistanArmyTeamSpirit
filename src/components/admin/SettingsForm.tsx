"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TOAST } from "@/lib/toast";
import { adminInput } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

type Settings = {
  registrationOpen: boolean;
  intlRegistrationOpen: boolean;
  registrationDeadline: string;
  participationConfirmDeadline: string;
  teamRegistrationOpenDate: string;
  teamRegistrationCloseDate: string;
  flightDetailsDeadline: string;
  maxTeamMembers: number;
  hostInfoPublished: boolean;
  hostInfoContent: string;
  exerciseYear: number;
  exerciseDates: string;
  privacyPolicyUrl: string;
  feeNoticeText: string;
  approvalNoticeText: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  merchandiseQrUrl: string;
  photographyQrUrl: string;
};

const defaults: Settings = {
  registrationOpen: true,
  intlRegistrationOpen: true,
  registrationDeadline: "",
  participationConfirmDeadline: "",
  teamRegistrationOpenDate: "",
  teamRegistrationCloseDate: "",
  flightDetailsDeadline: "",
  maxTeamMembers: 13,
  hostInfoPublished: false,
  hostInfoContent: "",
  exerciseYear: 2026,
  exerciseDates: "2 – 13 October 2026",
  privacyPolicyUrl: "/privacy",
  feeNoticeText: "",
  approvalNoticeText: "",
  facebookUrl: "#",
  twitterUrl: "#",
  instagramUrl: "#",
  merchandiseQrUrl: "https://www.theprintsofwales.co.uk/cambrian-patrol/",
  photographyQrUrl: "mailto:igphoto@yahoo.co.uk",
};

/** ISO/Date string → value for an <input type="datetime-local"> (local time). */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/* Tailwind class tokens shared across the settings cards. */
const CARD =
  "overflow-hidden rounded-[14px] border border-[#e4e7e0] bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]";
const CARD_HEADER = "border-b border-[#e4e7e0] bg-[#f7f9f5] px-[1.1rem] py-[0.7rem]";
const CARD_TITLE = "text-sm font-bold tracking-tight text-[#18221c]";
const CARD_DESC = "mt-1 text-xs leading-snug text-[#5a655c]";
const CARD_BODY = "px-[1.1rem] py-4";
const STACK = "flex flex-col gap-5";
const DUO_GRID = "grid grid-cols-1 gap-4 lg:grid-cols-2";

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD}>
      <div className={CARD_HEADER}>
        <h3 className={CARD_TITLE}>{title}</h3>
        {description ? <p className={CARD_DESC}>{description}</p> : null}
      </div>
      <div className={CARD_BODY}>{children}</div>
    </section>
  );
}

function SettingField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-semibold text-[#0f172a]">{label}</label>
      {hint ? (
        <p className="text-[0.8rem] leading-snug text-[#64748b]">{hint}</p>
      ) : null}
      {children}
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center rounded-[10px] border px-[1.125rem] py-3.5 transition-colors",
        checked
          ? "border-[#bbf7d0] bg-[#f0fdf4]"
          : "border-[#e2e8f0] bg-[#f8fafc]"
      )}
    >
      <label className="flex flex-1 items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#18221c]">{label}</span>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="shrink-0 data-[state=checked]:bg-brand-olive"
        />
      </label>
    </div>
  );
}

export function SettingsForm() {
  const [form, setForm] = useState<Settings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setForm({
            ...defaults,
            ...data.settings,
            registrationDeadline: toLocalInput(
              data.settings.registrationDeadline
            ),
            participationConfirmDeadline: toLocalInput(
              data.settings.participationConfirmDeadline
            ),
            teamRegistrationOpenDate: toLocalInput(
              data.settings.teamRegistrationOpenDate
            ),
            teamRegistrationCloseDate: toLocalInput(
              data.settings.teamRegistrationCloseDate
            ),
            flightDetailsDeadline: toLocalInput(
              data.settings.flightDetailsDeadline
            ),
            maxTeamMembers: Number(data.settings.maxTeamMembers ?? 13),
            hostInfoPublished: Boolean(data.settings.hostInfoPublished),
            hostInfoContent: data.settings.hostInfoContent ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        toast.success("Settings saved");
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[64rem] justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-[#1e5a3a]" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[64rem] flex-col gap-4 pb-8">
      <header className="rounded-[14px] border border-[#e4e7e0] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        <h1 className="text-[1.15rem] font-extrabold tracking-tight text-[#18221c]">
          Site settings
        </h1>
      </header>

      <SettingsCard title="Registration">
        <div className={STACK}>
          <SettingToggle
            label="Registration open"
            checked={form.registrationOpen}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, registrationOpen: v }))
            }
          />
          <div className={DUO_GRID}>
            <SettingField label="Exercise year">
              <Input
                type="number"
                value={form.exerciseYear}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    exerciseYear: parseInt(e.target.value, 10) || 2026,
                  }))
                }
                className={adminInput}
              />
            </SettingField>
            <SettingField label="Exercise dates">
              <Input
                value={form.exerciseDates}
                onChange={(e) =>
                  setForm((f) => ({ ...f, exerciseDates: e.target.value }))
                }
                className={adminInput}
              />
            </SettingField>
          </div>
          <div className={DUO_GRID}>
            <SettingField label="Registration deadline">
              <Input
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    registrationDeadline: e.target.value,
                  }))
                }
                className={adminInput}
              />
            </SettingField>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Participant workflow">
        <div className={STACK}>
          <SettingField label="Participation confirmation deadline">
            <Input
              type="datetime-local"
              value={form.participationConfirmDeadline}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  participationConfirmDeadline: e.target.value,
                }))
              }
              className={adminInput}
            />
          </SettingField>
          <div className={DUO_GRID}>
            <SettingField label="Team registration opens">
              <Input
                type="datetime-local"
                value={form.teamRegistrationOpenDate}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    teamRegistrationOpenDate: e.target.value,
                  }))
                }
                className={adminInput}
              />
            </SettingField>
            <SettingField label="Team registration closes">
              <Input
                type="datetime-local"
                value={form.teamRegistrationCloseDate}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    teamRegistrationCloseDate: e.target.value,
                  }))
                }
                className={adminInput}
              />
            </SettingField>
          </div>
          <div className={DUO_GRID}>
            <SettingField label="Flight details deadline">
              <Input
                type="datetime-local"
                value={form.flightDetailsDeadline}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    flightDetailsDeadline: e.target.value,
                  }))
                }
                className={adminInput}
              />
            </SettingField>
            <SettingField label="Maximum team members">
              <Input
                type="number"
                min={1}
                max={200}
                value={form.maxTeamMembers}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxTeamMembers: parseInt(e.target.value, 10) || 13,
                  }))
                }
                className={adminInput}
              />
            </SettingField>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Host information"
        description="Read-only hosting/arrival dashboard shown to participants whose flight details are finalized."
      >
        <div className={STACK}>
          <SettingToggle
            label="Host information published"
            checked={form.hostInfoPublished}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, hostInfoPublished: v }))
            }
          />
          <SettingField label="Hosting & arrival information">
            <Textarea
              rows={6}
              value={form.hostInfoContent}
              onChange={(e) =>
                setForm((f) => ({ ...f, hostInfoContent: e.target.value }))
              }
              className={cn(adminInput, "min-h-[8rem] resize-y")}
              placeholder="Arrival procedures, host unit contacts, accommodation, transport…"
            />
          </SettingField>
        </div>
      </SettingsCard>

      <SettingsCard title="Save">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} disabled={saving} variant="adminPrimary">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saved ? "Saved" : "Save settings"}
          </Button>
          <p className="min-w-0 flex-[1_1_14rem] text-[0.8rem] leading-snug text-muted-foreground">
            Saves every section on this page.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}
