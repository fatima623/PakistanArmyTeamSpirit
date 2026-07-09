"use client";

import { useEffect, useState } from "react";
import { Banknote, Globe, Landmark, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_PAYMENT_SETTINGS,
  formatRegistrationFee,
} from "@/lib/payment-settings";
import { TOAST } from "@/lib/toast";
import { adminInput } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

type Settings = {
  registrationOpen: boolean;
  intlRegistrationOpen: boolean;
  registrationDeadline: string;
  paymentDeadline: string;
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
  defaultPaymentAmount: number;
  paymentCurrency: string;
  paymentBankName: string;
  paymentBankAccountTitle: string;
  paymentBankAccountNumber: string;
  paymentBankIban: string;
  paymentWiseEmail: string;
  paymentWiseName: string;
  paymentMobileNumber: string;
  paymentMobileTitle: string;
  paymentRemitlyEmail: string;
  paymentRemitlyName: string;
};

const defaults: Settings = {
  registrationOpen: true,
  intlRegistrationOpen: true,
  registrationDeadline: "",
  paymentDeadline: "",
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
  defaultPaymentAmount: DEFAULT_PAYMENT_SETTINGS.registrationFee,
  paymentCurrency: DEFAULT_PAYMENT_SETTINGS.currency,
  paymentBankName: DEFAULT_PAYMENT_SETTINGS.bankName,
  paymentBankAccountTitle: DEFAULT_PAYMENT_SETTINGS.bankAccountTitle,
  paymentBankAccountNumber: DEFAULT_PAYMENT_SETTINGS.bankAccountNumber,
  paymentBankIban: DEFAULT_PAYMENT_SETTINGS.bankIban,
  paymentWiseEmail: DEFAULT_PAYMENT_SETTINGS.wiseEmail,
  paymentWiseName: DEFAULT_PAYMENT_SETTINGS.wiseName,
  paymentMobileNumber: DEFAULT_PAYMENT_SETTINGS.mobileNumber,
  paymentMobileTitle: DEFAULT_PAYMENT_SETTINGS.mobileTitle,
  paymentRemitlyEmail: DEFAULT_PAYMENT_SETTINGS.remitlyEmail,
  paymentRemitlyName: DEFAULT_PAYMENT_SETTINGS.remitlyName,
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
          className="shrink-0 data-[state=checked]:bg-cp-olive"
        />
      </label>
    </div>
  );
}

function PaymentMethodCard({
  icon: Icon,
  title,
  subtitle,
  wide = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  /** Full-width primary method — lays fields out in two columns. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-white px-5 pb-5 pt-[1.1rem] shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-[border-color,box-shadow] hover:border-[#cfe0d5] hover:shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2.5 border-b border-[#eef2f0] pb-3.5">
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#dbe6dc] bg-[#eaf1ea] text-[#1e5a3a]"
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-bold tracking-tight text-[#0f172a]">
            {title}
          </h4>
          {subtitle ? (
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#94a3b8]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <div className={cn("grid grid-cols-1 gap-4", wide && "sm:grid-cols-2")}>
        {children}
      </div>
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
            defaultPaymentAmount: Number(
              data.settings.defaultPaymentAmount ??
                DEFAULT_PAYMENT_SETTINGS.registrationFee
            ),
            paymentCurrency:
              data.settings.paymentCurrency ?? defaults.paymentCurrency,
            paymentBankName:
              data.settings.paymentBankName ?? defaults.paymentBankName,
            paymentBankAccountTitle:
              data.settings.paymentBankAccountTitle ??
              defaults.paymentBankAccountTitle,
            paymentBankAccountNumber:
              data.settings.paymentBankAccountNumber ??
              defaults.paymentBankAccountNumber,
            paymentBankIban:
              data.settings.paymentBankIban ?? defaults.paymentBankIban,
            paymentWiseEmail:
              data.settings.paymentWiseEmail ?? defaults.paymentWiseEmail,
            paymentWiseName:
              data.settings.paymentWiseName ?? defaults.paymentWiseName,
            paymentMobileNumber:
              data.settings.paymentMobileNumber ??
              defaults.paymentMobileNumber,
            paymentMobileTitle:
              data.settings.paymentMobileTitle ?? defaults.paymentMobileTitle,
            paymentRemitlyEmail:
              data.settings.paymentRemitlyEmail ??
              defaults.paymentRemitlyEmail,
            paymentRemitlyName:
              data.settings.paymentRemitlyName ??
              defaults.paymentRemitlyName,
            registrationDeadline: toLocalInput(
              data.settings.registrationDeadline
            ),
            paymentDeadline: toLocalInput(data.settings.paymentDeadline),
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
      <div className="mx-auto flex max-w-[52rem] justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-[#1e5a3a]" />
      </div>
    );
  }

  const currency = (form.paymentCurrency || "PKR").toUpperCase();

  return (
    <div className="mx-auto flex max-w-[52rem] flex-col gap-4 pb-8">
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
            <SettingField label="Payment deadline">
              <Input
                type="datetime-local"
                value={form.paymentDeadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentDeadline: e.target.value }))
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

      <SettingsCard
        title="Payment settings"
        description="Registration fee and the bank / mobile transfer details shown to approved participants."
      >
        <div className={STACK}>
          <div className="flex flex-wrap items-start gap-x-7 gap-y-4 rounded-xl border border-[#cfe6d8] bg-gradient-to-b from-[#f1f9f4] to-[#f9fbf9] px-[1.35rem] py-[1.15rem]">
            <div className="flex min-w-0 flex-1 basis-60 flex-col gap-2.5">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#15803d]">
                Registration fee
              </span>
              <div className="inline-flex max-w-full items-stretch self-start overflow-hidden rounded-[10px] border border-[#cbd5e1] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] focus-within:border-[#9cbf8a] focus-within:ring-[3px] focus-within:ring-[#1e5a3a]/15">
                <span className="inline-flex items-center border-r border-[#e2e8f0] bg-[#f1f5f9] px-3.5 text-[0.8125rem] font-bold tracking-wide text-[#475569]">
                  {currency}
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  inputMode="numeric"
                  aria-label="Registration fee amount"
                  value={form.defaultPaymentAmount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      defaultPaymentAmount:
                        parseInt(e.target.value, 10) ||
                        DEFAULT_PAYMENT_SETTINGS.registrationFee,
                    }))
                  }
                  className="w-[8.5rem] max-w-full border-0 bg-transparent px-3.5 py-2 text-[1.35rem] font-bold tabular-nums text-[#0f172a] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
              <p className="text-[0.78rem] leading-relaxed text-[#475569]">
                Charged to every approved participant — they see{" "}
                <strong className="font-bold text-[#15803d]">
                  {formatRegistrationFee(form.defaultPaymentAmount, currency)}
                </strong>
                .
              </p>
            </div>
            <div className="min-w-[8rem] shrink grow-0 basis-44">
              <SettingField label="Currency" hint="ISO code — e.g. PKR, USD, GBP.">
                <Input
                  value={form.paymentCurrency}
                  maxLength={3}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      paymentCurrency: e.target.value.toUpperCase(),
                    }))
                  }
                  className={cn(
                    adminInput,
                    "max-w-[8rem] font-semibold uppercase tracking-wide"
                  )}
                />
              </SettingField>
            </div>
          </div>

          <PaymentMethodCard
            icon={Landmark}
            title="Bank transfer"
            subtitle="Domestic PKR account"
            wide
          >
            <SettingField label="Bank name">
              <Input
                value={form.paymentBankName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentBankName: e.target.value }))
                }
                className={adminInput}
              />
            </SettingField>
            <SettingField label="Account title">
              <Input
                value={form.paymentBankAccountTitle}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    paymentBankAccountTitle: e.target.value,
                  }))
                }
                className={adminInput}
              />
            </SettingField>
            <SettingField label="Account number">
              <Input
                value={form.paymentBankAccountNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    paymentBankAccountNumber: e.target.value,
                  }))
                }
                className={adminInput}
              />
            </SettingField>
            <SettingField label="IBAN" hint="Optional — leave blank to hide.">
              <Input
                value={form.paymentBankIban}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentBankIban: e.target.value }))
                }
                className={adminInput}
              />
            </SettingField>
          </PaymentMethodCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <PaymentMethodCard
              icon={Globe}
              title="Wise transfer"
              subtitle="International"
            >
              <SettingField label="Wise email">
                <Input
                  value={form.paymentWiseEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentWiseEmail: e.target.value }))
                  }
                  className={adminInput}
                />
              </SettingField>
              <SettingField label="Recipient name">
                <Input
                  value={form.paymentWiseName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, paymentWiseName: e.target.value }))
                  }
                  className={adminInput}
                />
              </SettingField>
            </PaymentMethodCard>

            <PaymentMethodCard
              icon={Smartphone}
              title="Mobile wallets"
              subtitle="JazzCash / Easypaisa"
            >
              <SettingField label="Wallet number">
                <Input
                  value={form.paymentMobileNumber}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      paymentMobileNumber: e.target.value,
                    }))
                  }
                  className={adminInput}
                />
              </SettingField>
              <SettingField label="Account title">
                <Input
                  value={form.paymentMobileTitle}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      paymentMobileTitle: e.target.value,
                    }))
                  }
                  className={adminInput}
                />
              </SettingField>
            </PaymentMethodCard>

            <PaymentMethodCard
              icon={Banknote}
              title="Remitly"
              subtitle="International"
            >
              <SettingField label="Remitly email">
                <Input
                  value={form.paymentRemitlyEmail}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      paymentRemitlyEmail: e.target.value,
                    }))
                  }
                  className={adminInput}
                />
              </SettingField>
              <SettingField label="Recipient name">
                <Input
                  value={form.paymentRemitlyName}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      paymentRemitlyName: e.target.value,
                    }))
                  }
                  className={adminInput}
                />
              </SettingField>
            </PaymentMethodCard>
          </div>
        </div>
      </SettingsCard>

      <section className={CARD}>
        <div className={CARD_BODY}>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={handleSave} disabled={saving} variant="adminPrimary">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saved ? "Saved" : "Save settings"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
