"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  Lock,
  Pencil,
  Plane,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { TOAST } from "@/lib/toast";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const DATE_TAG: Record<Locale, string> = {
  en: "en-GB",
  ru: "ru-RU",
  tr: "tr-TR",
  ar: "ar",
  zh: "zh-CN",
};

export type FlightRecord = {
  id: string;
  teamMemberId: string | null;
  passengerName: string;
  passportNumber: string;
  passportFileName: string | null;
  passportFileSize?: number | null;
  passportUploadedAt: string | null;
  ticketFileName: string | null;
  ticketFileSize?: number | null;
  ticketUploadedAt: string | null;
  updatedAt: string;
  teamMember: {
    id: string;
    fullName: string;
    rank: string;
    serviceNumber: string;
  } | null;
};

function fmtFileSize(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

type FormState = {
  passengerName: string;
  passportNumber: string;
  passportFile: File | null;
  ticketFile: File | null;
};

function fmtDateTime(iso: string | null, tag: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(tag, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" && /\.pdf$/i.test(file.name);
}

/** Document tile — icon square, name + “PDF · 2.4 MB”, View PDF button. */
function DocStatus({
  label,
  uploaded,
  fileName,
  fileSize,
  href,
  icon: DocIcon,
  tx,
}: {
  label: string;
  uploaded: boolean;
  fileName: string | null;
  fileSize?: number | null;
  href: string;
  icon: typeof FileText;
  tx: Dictionary["flights"]["doc"];
}) {
  const size = fmtFileSize(fileSize);
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4">
      <span
        className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700"
        aria-hidden
      >
        <DocIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[0.875rem] font-bold leading-tight text-slate-900">
          {label}
        </p>
        <p className="m-0 mt-0.5 truncate text-[0.78rem] text-slate-500">
          {uploaded ? (fileName ?? tx.uploaded) : tx.notUploadedYet}
        </p>
        <p className="m-0 mt-0.5 text-[0.72rem] font-medium uppercase tracking-[0.02em] text-slate-400">
          {uploaded ? tx.pdfLabel(size) : tx.required}
        </p>
      </div>
      {uploaded ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-none items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-emerald-700 no-underline transition-colors hover:border-emerald-400 hover:bg-emerald-50"
          title={tx.openPdfTitle(label)}
        >
          <FileText className="h-3.5 w-3.5" aria-hidden />
          {tx.viewPdf}
        </a>
      ) : (
        <span className="pp-badge pp-badge--warning flex-none">
          <FileUp className="h-3.5 w-3.5" aria-hidden />
          {tx.missing}
        </span>
      )}
    </div>
  );
}

/**
 * Flight information — a single, team-level submission (one passport + ticket
 * set for the whole team). Editable until the deadline or administrative
 * finalization.
 */
export function FlightDetailsManager({
  initialFlights,
  canEdit,
  finalized,
  deadlineIso,
  deadlinePassed,
}: {
  initialFlights: FlightRecord[];
  canEdit: boolean;
  finalized: boolean;
  deadlineIso: string | null;
  deadlinePassed: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const fl = t.flights;
  const dateTag = DATE_TAG[locale];
  const [flight, setFlight] = useState<FlightRecord | null>(
    initialFlights[0] ?? null
  );
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>({
    passengerName: initialFlights[0]?.passengerName ?? "",
    passportNumber: initialFlights[0]?.passportNumber ?? "",
    passportFile: null,
    ticketFile: null,
  });

  const deadlineLabel = useMemo(() => {
    if (!deadlineIso) return null;
    return new Date(deadlineIso).toLocaleString(dateTag, {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [deadlineIso, dateTag]);

  const apiError = async (res: Response) => {
    const data = await res.json().catch(() => ({}));
    if (data.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (typeof first === "string") return first;
    }
    return typeof data.error === "string" ? data.error : TOAST.GENERIC_ERROR;
  };

  const startEdit = () => {
    setForm({
      passengerName: flight?.passengerName ?? "",
      passportNumber: flight?.passportNumber ?? "",
      passportFile: null,
      ticketFile: null,
    });
    setEditing(true);
  };

  const submit = async () => {
    if (!form.passengerName.trim()) {
      toast.error(fl.errors.nameRequired);
      return;
    }
    if (form.passportNumber.trim().length < 3) {
      toast.error(fl.errors.passportRequired);
      return;
    }
    for (const [file, label] of [
      [form.passportFile, fl.errors.passportLabel],
      [form.ticketFile, fl.errors.ticketLabel],
    ] as const) {
      if (file && !isPdf(file)) {
        toast.error(fl.errors.mustBePdf(label));
        return;
      }
      if (file && file.size > 10 * 1024 * 1024) {
        toast.error(fl.errors.mustBeUnder10(label));
        return;
      }
    }

    const fd = new FormData();
    fd.set("passengerName", form.passengerName.trim());
    fd.set("passportNumber", form.passportNumber.trim());
    if (form.passportFile) fd.set("passport", form.passportFile);
    if (form.ticketFile) fd.set("ticket", form.ticketFile);

    setBusy(true);
    try {
      const res = await fetch(
        flight ? `/api/user/flights/${flight.id}` : "/api/user/flights",
        { method: flight ? "PUT" : "POST", body: fd }
      );
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      const { flight: saved } = (await res.json()) as { flight: FlightRecord };
      setFlight(saved);
      setEditing(false);
      toast.success(flight ? fl.errors.updated : fl.errors.submitted);
      router.refresh();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const showForm = editing || !flight;

  return (
    <div className="space-y-4">
      {finalized ? (
        <div className="flex items-start gap-3.5 rounded-2xl border-l-4 border border-emerald-200 border-l-emerald-600 bg-emerald-50/70 px-5 py-4">
          <span
            className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-emerald-600 text-white"
            aria-hidden
          >
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-[0.9375rem] font-bold leading-snug text-emerald-800">
              {fl.banners.finalizedTitle}
            </p>
            <p className="m-0 mt-1 text-[0.8125rem] leading-relaxed text-slate-600">
              {fl.banners.finalizedSub}
            </p>
          </div>
        </div>
      ) : deadlinePassed ? (
        <div className="portal-alert-error flex items-start gap-2 px-4 py-3 text-sm">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {fl.banners.deadlinePassed}
        </div>
      ) : deadlineLabel ? (
        <div className="portal-alert-info flex items-start gap-2 px-4 py-3 text-sm">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {fl.banners.deadlineInfo(deadlineLabel)}
        </div>
      ) : null}

      <section className="pp-card">
        <div className="pp-card__head">
          <div className="flex min-w-0 items-start gap-3.5">
            <span
              className="mt-0.5 flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700"
              aria-hidden
            >
              <Plane className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="pp-card__title">{fl.card.title}</h2>
              <p className="pp-card__desc" style={{ marginTop: "0.2rem" }}>
                {fl.card.desc}
              </p>
            </div>
          </div>
          <span
            className={`pp-badge ${flight ? "pp-badge--success" : "pp-badge--neutral"}`}
          >
            {flight ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                {fl.card.submitted}
              </>
            ) : (
              fl.card.notSubmitted
            )}
          </span>
        </div>

        {showForm ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fd-name" className="pp-label">
                  {fl.form.leadName}
                </label>
                <Input
                  id="fd-name"
                  value={form.passengerName}
                  onChange={(e) =>
                    setForm({ ...form, passengerName: e.target.value })
                  }
                  placeholder={fl.form.leadNamePlaceholder}
                  disabled={busy}
                />
              </div>
              <div>
                <label htmlFor="fd-passport-no" className="pp-label">
                  {fl.form.passportNumber}
                </label>
                <Input
                  id="fd-passport-no"
                  value={form.passportNumber}
                  onChange={(e) =>
                    setForm({ ...form, passportNumber: e.target.value })
                  }
                  placeholder={fl.form.passportNumberPlaceholder}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fd-passport-file" className="pp-label">
                  {fl.form.passportDoc}
                </label>
                <input
                  id="fd-passport-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={busy}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      passportFile: e.target.files?.[0] ?? null,
                    })
                  }
                  className="pp-file"
                />
                {flight?.passportFileName ? (
                  <p className="mt-1 text-xs text-slate-500">
                    <FileText className="mr-1 inline h-3 w-3" aria-hidden />
                    {fl.form.currentFile(flight.passportFileName)}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="fd-ticket-file" className="pp-label">
                  {fl.form.ticketDoc}
                </label>
                <input
                  id="fd-ticket-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={busy}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ticketFile: e.target.files?.[0] ?? null,
                    })
                  }
                  className="pp-file"
                />
                {flight?.ticketFileName ? (
                  <p className="mt-1 text-xs text-slate-500">
                    <FileText className="mr-1 inline h-3 w-3" aria-hidden />
                    {fl.form.currentFile(flight.ticketFileName)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="pp-btn pp-btn--primary"
                disabled={busy}
                onClick={submit}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                )}
                {flight ? fl.form.saveChanges : fl.form.submitFlight}
              </button>
              {flight ? (
                <button
                  type="button"
                  className="pp-btn pp-btn--ghost"
                  disabled={busy}
                  onClick={() => setEditing(false)}
                >
                  {fl.form.cancel}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-5 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <div>
                <p className="m-0 text-[0.75rem] font-medium text-slate-500">
                  {fl.view.leadTraveller}
                </p>
                <p className="m-0 mt-1 text-[0.9375rem] font-bold text-slate-900">
                  {flight.passengerName}
                </p>
              </div>
              <div>
                <p className="m-0 text-[0.75rem] font-medium text-slate-500">
                  {fl.view.passportNumber}
                </p>
                <p
                  className="m-0 mt-1 text-[0.9375rem] font-bold tracking-wide text-slate-900"
                  style={{ fontFamily: "ui-monospace, monospace" }}
                >
                  {flight.passportNumber}
                </p>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <DocStatus
                label={fl.labels.passport}
                icon={FileText}
                uploaded={!!flight.passportFileName}
                fileName={flight.passportFileName}
                fileSize={flight.passportFileSize}
                href={`/api/user/flights/${flight.id}/file?type=passport`}
                tx={fl.doc}
              />
              <DocStatus
                label={fl.labels.flightTicket}
                icon={Ticket}
                uploaded={!!flight.ticketFileName}
                fileName={flight.ticketFileName}
                fileSize={flight.ticketFileSize}
                href={`/api/user/flights/${flight.id}/file?type=ticket`}
                tx={fl.doc}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                  aria-hidden
                >
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <p className="m-0 text-[0.72rem] font-medium text-slate-500">
                    {fl.view.lastUpdated}
                  </p>
                  <p className="m-0 mt-0.5 text-[0.875rem] font-bold text-slate-900">
                    {fmtDateTime(flight.updatedAt, dateTag)}
                  </p>
                </div>
              </div>
              {canEdit ? (
                <button
                  type="button"
                  className="pp-btn pp-btn--ghost"
                  onClick={startEdit}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  {fl.view.editDetails}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
