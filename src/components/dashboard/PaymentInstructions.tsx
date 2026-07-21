"use client";

import { useState } from "react";
import {
  Banknote,
  Building2,
  Check,
  Copy,
  Globe,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

import type { PaymentSettingsPublic } from "@/lib/payment-settings";
import { formatRegistrationFee } from "@/lib/payment-settings";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";

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
      <p className="m-0 mb-1 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "m-0 text-[0.9375rem] font-bold leading-snug text-slate-900",
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
  const { t } = useI18n();
  const pi = t.payment.instructions;
  const fee = formatRegistrationFee(settings.registrationFee, settings.currency);

  const methods = [
    {
      id: "bank",
      title: pi.methods.bank,
      detailsTitle: pi.detailsTitle.bank,
      detailsSub: pi.detailsSub.bank,
      icon: Building2,
      rows: [
        { label: pi.rows.bankName, value: settings.bankName },
        { label: pi.rows.accountTitle, value: settings.bankAccountTitle },
        { label: pi.rows.accountNumber, value: settings.bankAccountNumber, mono: true },
        { label: pi.rows.ibanSwift, value: settings.bankIban, mono: true, scrollable: true },
      ],
    },
    {
      id: "wise",
      title: pi.methods.wise,
      detailsTitle: pi.detailsTitle.wise,
      detailsSub: pi.detailsSub.wise,
      icon: Globe,
      rows: [
        { label: pi.rows.wiseEmail, value: settings.wiseEmail, scrollable: true },
        { label: pi.rows.recipientName, value: settings.wiseName },
      ],
    },
    {
      id: "mobile",
      title: pi.methods.mobile,
      detailsTitle: pi.detailsTitle.mobile,
      detailsSub: pi.detailsSub.mobile,
      icon: Smartphone,
      rows: [
        { label: pi.rows.walletNumber, value: settings.mobileNumber, mono: true },
        { label: pi.rows.accountTitle, value: settings.mobileTitle },
      ],
    },
    {
      id: "remitly",
      title: pi.methods.remitly,
      detailsTitle: pi.detailsTitle.remitly,
      detailsSub: pi.detailsSub.remitly,
      icon: Banknote,
      rows: [
        { label: pi.rows.remitlyEmail, value: settings.remitlyEmail, scrollable: true },
        { label: pi.rows.recipientName, value: settings.remitlyName },
      ],
    },
  ].filter((m) => m.rows.some((r) => r.value?.trim()));

  const [selected, setSelected] = useState(methods[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const active = methods.find((m) => m.id === selected) ?? methods[0] ?? null;

  const copyDetails = async () => {
    if (!active) return;
    const text = [
      pi.copyHeader(active.detailsTitle, fee),
      ...active.rows
        .filter((r) => r.value?.trim())
        .map((r) => `${r.label}: ${r.value}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(pi.toastCopied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(pi.toastCopyFail);
    }
  };

  const ActiveIcon = active?.icon ?? Building2;

  return (
    <section className="min-w-0 space-y-5">
      {/* —— Registration fee banner —————————————————————————— */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-6 py-4">
        <div>
          <p className="m-0 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-emerald-700">
            {pi.registrationFee}
          </p>
          <p className="m-0 mt-1 font-display text-[2rem] font-bold leading-none tracking-tight text-emerald-700">
            {fee}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700"
            aria-hidden
          >
            <ShieldCheck className="h-5 w-5" />
          </span>
          <p className="m-0 max-w-[13rem] text-[0.8125rem] leading-snug text-slate-600">
            <strong className="font-bold text-slate-900">
              {pi.sendExactBold}
            </strong>{" "}
            {pi.sendExactRest}
          </p>
        </div>
      </div>

      {/* —— Method chooser ———————————————————————————————————— */}
      {active ? (
        <div>
          <p className="m-0 mb-2.5 text-[0.875rem] font-bold text-slate-900">
            {pi.chooseMethod}
          </p>
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
                      ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/25"
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
                      isSel ? "!text-emerald-800" : "text-slate-700"
                    )}
                  >
                    {m.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* —— Selected method details ————————————————————— */}
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100/80 text-emerald-700"
                  aria-hidden
                >
                  <ActiveIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h4 className="m-0 text-[0.9375rem] font-bold text-slate-900">
                    {active.detailsTitle}
                  </h4>
                  <p className="m-0 mt-0.5 text-[0.78rem] text-slate-500">
                    {active.detailsSub}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="grid flex-1 gap-x-6 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                {active.rows.map((r) => (
                  <DetailRow key={r.label} {...r} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => void copyDetails()}
                className="inline-flex flex-none items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-emerald-700 transition-colors hover:border-emerald-500 hover:bg-emerald-50"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
                {copied ? pi.copied : pi.copyDetails}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* —— Steps to complete payment ————————————————————————— */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4">
        <p className="m-0 mb-3 text-[0.875rem] font-bold text-slate-900">
          {pi.stepsTitle}
        </p>
        <ol className="m-0 flex list-none flex-col gap-0 p-0">
          {pi.steps.map((step, i) => (
            <li key={step} className="relative flex items-start gap-3 pb-3 last:pb-0">
              {i < pi.steps.length - 1 ? (
                <span
                  className="absolute bottom-0 left-[13px] top-7 w-px bg-amber-300/70"
                  aria-hidden
                />
              ) : null}
              <span
                className="z-[1] flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full border border-amber-400 bg-white text-[0.75rem] font-bold !text-black"
                aria-hidden
              >
                {i + 1}
              </span>
              <p className="m-0 pt-1 text-[0.8125rem] leading-relaxed text-slate-700">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
