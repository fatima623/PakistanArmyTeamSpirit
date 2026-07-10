"use client";

import { useState } from "react";
import { Banknote, Building2, Check, Globe, Smartphone } from "lucide-react";

import type { PaymentSettingsPublic } from "@/lib/payment-settings";
import { formatRegistrationFee } from "@/lib/payment-settings";
import { cn } from "@/lib/utils";

type Props = {
  settings: PaymentSettingsPublic;
  compact?: boolean;
};

type Detail = {
  label: string;
  value: string;
  mono?: boolean;
  scrollable?: boolean;
};

function DetailRow({ label, value, mono, scrollable }: Detail) {
  if (!value?.trim()) return null;

  return (
    <div className="min-w-0">
      <p className="portal-subtitle mb-1 text-[11px]">{label}</p>
      <p
        className={cn(
          "text-base font-semibold leading-snug text-brand-ink",
          mono && "font-mono tracking-wide tabular-nums",
          scrollable
            ? "max-w-full overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch]"
            : "whitespace-nowrap"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function PaymentInstructions({ settings }: Props) {
  const fee = formatRegistrationFee(settings.registrationFee, settings.currency);

  const methods = [
    {
      id: "bank",
      title: "Bank transfer",
      icon: Building2,
      rows: [
        { label: "Bank name", value: settings.bankName },
        { label: "Account title", value: settings.bankAccountTitle },
        { label: "Account number", value: settings.bankAccountNumber, mono: true },
        { label: "IBAN / SWIFT", value: settings.bankIban, mono: true, scrollable: true },
      ],
    },
    {
      id: "wise",
      title: "Wise",
      icon: Globe,
      rows: [
        { label: "Wise email", value: settings.wiseEmail, scrollable: true },
        { label: "Recipient name", value: settings.wiseName },
      ],
    },
    {
      id: "mobile",
      title: "Mobile wallet",
      icon: Smartphone,
      rows: [
        { label: "Wallet number", value: settings.mobileNumber, mono: true },
        { label: "Account title", value: settings.mobileTitle },
      ],
    },
    {
      id: "remitly",
      title: "Remitly",
      icon: Banknote,
      rows: [
        { label: "Remitly email", value: settings.remitlyEmail, scrollable: true },
        { label: "Recipient name", value: settings.remitlyName },
      ],
    },
  ].filter((m) => m.rows.some((r) => r.value?.trim()));

  const [selected, setSelected] = useState(methods[0]?.id ?? "");
  const active = methods.find((m) => m.id === selected) ?? methods[0] ?? null;

  return (
    <section className="min-w-0 space-y-6">
      <header className="space-y-2">
        <h3 className="portal-section-title text-lg">How to pay</h3>
        <p className="portal-muted">
          Pick a payment method, send the registration fee in full, then upload
          your proof below.
        </p>
      </header>

      {/* Registration fee highlight */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-6 py-5">
        <div>
          <p className="portal-subtitle">Registration fee</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
            {fee}
          </p>
        </div>
        <p className="max-w-[15rem] text-sm text-slate-600">
          Send exactly this amount before uploading your payment proof.
        </p>
      </div>

      {/* Selectable payment methods */}
      {active ? (
        <div>
          <p className="portal-subtitle mb-3">Choose a payment method</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {methods.map((m) => {
              const Icon = m.icon;
              const isSel = m.id === active.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m.id)}
                  aria-pressed={isSel}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-colors",
                    isSel
                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/25"
                      : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                  )}
                >
                  {isSel ? (
                    <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      isSel
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      "text-[0.8125rem] font-semibold",
                      isSel ? "text-emerald-800" : "text-slate-700"
                    )}
                  >
                    {m.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {active.rows.map((r) => (
                <DetailRow key={r.label} {...r} />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Steps */}
      <div className="portal-alert-warning">
        <p className="mb-3 text-sm font-bold text-brand-ink">
          Steps to complete payment
        </p>
        <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed marker:font-semibold">
          <li>Send the registration fee using the selected method above.</li>
          <li>Save your payment screenshot or receipt.</li>
          <li>
            Upload the payment proof with your transaction reference for
            verification.
          </li>
        </ol>
      </div>
    </section>
  );
}
