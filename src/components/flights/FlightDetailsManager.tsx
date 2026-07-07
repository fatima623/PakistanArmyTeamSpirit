"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  FileText,
  FileUp,
  Loader2,
  Lock,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { TOAST } from "@/lib/toast";

export type FlightRecord = {
  id: string;
  teamMemberId: string | null;
  passengerName: string;
  passportNumber: string;
  passportFileName: string | null;
  passportUploadedAt: string | null;
  ticketFileName: string | null;
  ticketUploadedAt: string | null;
  updatedAt: string;
  teamMember: {
    id: string;
    fullName: string;
    rank: string;
    serviceNumber: string;
  } | null;
};

type FormState = {
  passengerName: string;
  passportNumber: string;
  passportFile: File | null;
  ticketFile: File | null;
};

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
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

function DocStatus({
  label,
  uploaded,
  fileName,
  href,
}: {
  label: string;
  uploaded: boolean;
  fileName: string | null;
  href: string;
}) {
  return (
    <div className="pp-doc">
      <div className="min-w-0">
        <p className="pp-doc__label">{label}</p>
        <p className="pp-doc__name">
          {uploaded ? (fileName ?? "Uploaded") : "Not uploaded yet"}
        </p>
      </div>
      {uploaded ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="pp-badge pp-badge--success"
          title={`Open ${label} PDF`}
        >
          <FileCheck2 className="h-3.5 w-3.5" aria-hidden />
          View PDF
        </a>
      ) : (
        <span className="pp-badge pp-badge--warning">
          <FileUp className="h-3.5 w-3.5" aria-hidden />
          Missing
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
    return new Date(deadlineIso).toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [deadlineIso]);

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
      toast.error("Lead traveller name is required");
      return;
    }
    if (form.passportNumber.trim().length < 3) {
      toast.error("Passport number is required");
      return;
    }
    for (const [file, label] of [
      [form.passportFile, "Passport"],
      [form.ticketFile, "Flight ticket"],
    ] as const) {
      if (file && !isPdf(file)) {
        toast.error(`${label} must be a PDF file`);
        return;
      }
      if (file && file.size > 10 * 1024 * 1024) {
        toast.error(`${label} must be under 10MB`);
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
      toast.success(
        flight ? "Flight details updated" : "Flight details submitted"
      );
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
        <div className="portal-alert-success flex items-start gap-2 px-4 py-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Your flight details have been reviewed and finalized by the
          administration. Records are read-only. Host Information becomes
          available once published by the organizers.
        </div>
      ) : deadlinePassed ? (
        <div className="portal-alert-error flex items-start gap-2 px-4 py-3 text-sm">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          The flight details submission deadline has passed. Contact the
          organizers if corrections are required.
        </div>
      ) : deadlineLabel ? (
        <div className="portal-alert-info flex items-start gap-2 px-4 py-3 text-sm">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          You can submit or replace documents until {deadlineLabel} (or until
          records are locked by the administration).
        </div>
      ) : null}

      <section className="pp-card">
        <div className="pp-card__head">
          <div>
            <p className="pp-eyebrow">Flight details</p>
            <h2 className="pp-card__title" style={{ marginTop: "0.15rem" }}>
              Team flight information
            </h2>
            <p className="pp-card__desc">
              One submission covers your whole team — provide the lead
              traveller&apos;s details and upload the passport &amp; ticket
              documents (PDF, max 10MB each).
            </p>
          </div>
          <span
            className={`pp-badge ${flight ? "pp-badge--success" : "pp-badge--neutral"}`}
          >
            {flight ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Submitted
              </>
            ) : (
              "Not submitted"
            )}
          </span>
        </div>

        {showForm ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fd-name" className="pp-label">
                  Lead traveller name (as on passport)
                </label>
                <Input
                  id="fd-name"
                  value={form.passengerName}
                  onChange={(e) =>
                    setForm({ ...form, passengerName: e.target.value })
                  }
                  placeholder="e.g. CAPT SARA KHAN"
                  disabled={busy}
                />
              </div>
              <div>
                <label htmlFor="fd-passport-no" className="pp-label">
                  Passport number
                </label>
                <Input
                  id="fd-passport-no"
                  value={form.passportNumber}
                  onChange={(e) =>
                    setForm({ ...form, passportNumber: e.target.value })
                  }
                  placeholder="e.g. AB1234567"
                  disabled={busy}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fd-passport-file" className="pp-label">
                  Passport document (PDF)
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
                    Current: {flight.passportFileName}. Leave empty to keep it.
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="fd-ticket-file" className="pp-label">
                  Flight ticket (PDF)
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
                    Current: {flight.ticketFileName}. Leave empty to keep it.
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
                {flight ? "Save changes" : "Submit flight details"}
              </button>
              {flight ? (
                <button
                  type="button"
                  className="pp-btn pp-btn--ghost"
                  disabled={busy}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="pp-dl__term">Lead traveller</p>
                <p className="pp-dl__desc">{flight.passengerName}</p>
              </div>
              <div>
                <p className="pp-dl__term">Passport number</p>
                <p className="pp-dl__desc" style={{ fontFamily: "ui-monospace, monospace" }}>
                  {flight.passportNumber}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DocStatus
                label="Passport"
                uploaded={!!flight.passportFileName}
                fileName={flight.passportFileName}
                href={`/api/user/flights/${flight.id}/file?type=passport`}
              />
              <DocStatus
                label="Flight ticket"
                uploaded={!!flight.ticketFileName}
                fileName={flight.ticketFileName}
                href={`/api/user/flights/${flight.id}/file?type=ticket`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Last updated {fmtDateTime(flight.updatedAt)}
              </p>
              {canEdit ? (
                <button
                  type="button"
                  className="pp-btn pp-btn--ghost"
                  onClick={startEdit}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Edit details
                </button>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
