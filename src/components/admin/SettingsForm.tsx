"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_PAYMENT_SETTINGS } from "@/lib/payment-settings";
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
    <section className="admin-user-detail-card">
      <div className="admin-user-detail-card-header">
        <h3 className="admin-user-detail-card-title">{title}</h3>
        {description ? (
          <p className="admin-user-detail-card-desc">{description}</p>
        ) : null}
      </div>
      <div className="admin-user-detail-card-body">{children}</div>
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
    <div className={cn("admin-user-detail-field", className)}>
      <label className="text-sm font-semibold text-[#0f172a]">{label}</label>
      {hint ? (
        <p className="admin-user-detail-status-controls-hint">{hint}</p>
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
        "admin-settings-toggle-row",
        checked && "admin-settings-toggle-row--on"
      )}
    >
      <label className="flex flex-1 items-center justify-between gap-3">
        <span className="text-sm font-medium text-cp-ink">{label}</span>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="shrink-0 data-[state=checked]:bg-cp-olive"
        />
      </label>
    </div>
  );
}

function PaymentGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-settings-payment-group">
      <h4 className="admin-settings-payment-group-title">{title}</h4>
      <div className="admin-settings-grid">{children}</div>
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
      <div className="admin-user-detail-page admin-settings-page">
        <div className="flex justify-center py-16">
          <Loader2 className="admin-icon-accent h-7 w-7 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-detail-page admin-settings-page">
      <header className="admin-user-detail-hero">
        <div className="admin-user-detail-hero-main">
          <h1 className="admin-user-detail-name">Site settings</h1>
          <p className="admin-user-detail-subline">
            Registration, dashboard notices, payment details, and public
            links. Save when you are done editing.
          </p>
        </div>
      </header>

      <SettingsCard title="Registration">
        <div className="admin-settings-stack">
          <SettingToggle
            label="Registration open"
            checked={form.registrationOpen}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, registrationOpen: v }))
            }
          />
          <div className="admin-user-detail-grid admin-user-detail-grid--duo">
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
          <div className="admin-user-detail-grid admin-user-detail-grid--duo">
            <SettingField
              label="Registration deadline"
              hint="After this date/time, new registrations are blocked. Leave empty for no deadline."
            >
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
            <SettingField
              label="Payment deadline"
              hint="After this date/time, payment submission is blocked. Leave empty for no deadline."
            >
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

      <SettingsCard
        title="Participant workflow"
        description="Deadlines and windows for the guided participant journey: confirmation → team registration → roster → flight details → host information."
      >
        <div className="admin-settings-stack">
          <SettingField
            label="Participation confirmation deadline"
            hint="Participants must confirm their registration (first-login dialog) before this date/time. After it passes, confirmation is disabled. Leave empty for no deadline."
          >
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
          <div className="admin-user-detail-grid admin-user-detail-grid--duo">
            <SettingField
              label="Team registration opens"
              hint="Empty = open immediately."
            >
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
            <SettingField
              label="Team registration closes"
              hint="Empty = no closing date."
            >
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
          <div className="admin-user-detail-grid admin-user-detail-grid--duo">
            <SettingField
              label="Flight details deadline"
              hint="Participants can edit/replace flight documents until this date/time or until finalized."
            >
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
            <SettingField
              label="Maximum team members"
              hint="Default cap per team (13). Per-team increases are granted via Team Size Requests."
            >
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
        <div className="admin-settings-stack">
          <SettingToggle
            label="Host information published"
            checked={form.hostInfoPublished}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, hostInfoPublished: v }))
            }
          />
          <SettingField
            label="Hosting & arrival information"
            hint="Shown at the top of the participant Host Information page. Basic HTML is allowed and sanitized."
          >
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
        title="Dashboard notices"
        description="Banners shown on the participant dashboard."
      >
        <div className="admin-settings-stack">
          <SettingField
            label="Fee notice text"
            hint="Leave empty to hide the fee notice banner."
          >
            <Textarea
              rows={3}
              value={form.feeNoticeText}
              onChange={(e) =>
                setForm((f) => ({ ...f, feeNoticeText: e.target.value }))
              }
              className={cn(adminInput, "min-h-[5rem] resize-y")}
            />
          </SettingField>
          <SettingField label="Approval notice text">
            <Textarea
              rows={3}
              value={form.approvalNoticeText}
              onChange={(e) =>
                setForm((f) => ({ ...f, approvalNoticeText: e.target.value }))
              }
              className={cn(adminInput, "min-h-[5rem] resize-y")}
            />
          </SettingField>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Payment settings"
        description="Bank and mobile payment details for approved participants (PKR manual transfer)."
      >
        <div className="admin-settings-stack">
          <div className="admin-user-detail-grid admin-user-detail-grid--duo">
            <SettingField label="Registration fee amount">
              <Input
                type="number"
                step="1"
                min="1"
                value={form.defaultPaymentAmount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    defaultPaymentAmount:
                      parseInt(e.target.value, 10) ||
                      DEFAULT_PAYMENT_SETTINGS.registrationFee,
                  }))
                }
                className={adminInput}
              />
            </SettingField>
            <SettingField label="Currency code">
              <Input
                value={form.paymentCurrency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentCurrency: e.target.value }))
                }
                className={adminInput}
              />
            </SettingField>
          </div>

          <PaymentGroup title="Bank transfer">
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
            <SettingField
              label="IBAN"
              hint="Optional — leave blank to hide."
              className="admin-settings-grid-span-2"
            >
              <Input
                value={form.paymentBankIban}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentBankIban: e.target.value }))
                }
                className={adminInput}
              />
            </SettingField>
          </PaymentGroup>

          <div className="admin-settings-mobile-grid">
            <PaymentGroup title="Wise transfer">
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
            </PaymentGroup>

            <PaymentGroup title="Mobile wallets">
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
            </PaymentGroup>

            <PaymentGroup title="Remitly">
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
            </PaymentGroup>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="QR links">
        <div className="admin-user-detail-grid admin-user-detail-grid--duo">
          <SettingField label="Merchandise QR / link">
            <Input
              value={form.merchandiseQrUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, merchandiseQrUrl: e.target.value }))
              }
              className={adminInput}
            />
          </SettingField>
          <SettingField label="Photography QR / link">
            <Input
              value={form.photographyQrUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, photographyQrUrl: e.target.value }))
              }
              className={adminInput}
            />
          </SettingField>
        </div>
      </SettingsCard>

      <SettingsCard title="Social links">
        <div className="admin-user-detail-grid admin-user-detail-grid--duo">
          {(
            [
              ["facebookUrl", "Facebook URL"],
              ["twitterUrl", "Twitter/X URL"],
              ["instagramUrl", "Instagram URL"],
              ["privacyPolicyUrl", "Privacy policy URL"],
            ] as const
          ).map(([key, label]) => (
            <SettingField key={key} label={label}>
              <Input
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className={adminInput}
              />
            </SettingField>
          ))}
        </div>
      </SettingsCard>

      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-body">
          <div className="admin-user-detail-actions admin-settings-save-row">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="adminPrimary"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saved ? "Saved" : "Save settings"}
            </Button>
            <p className="admin-user-detail-status-controls-hint">
              Changes apply to registration, participant dashboard, and payment
              instructions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
