"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileText,
  FileUp,
  Link2,
  Loader2,
  Lock,
  Pencil,
  Plane,
  Plus,
  Ticket,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { TOAST } from "@/lib/toast";
import type { TeamMemberRecord } from "@/lib/team-members";
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

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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

/**
 * Per-traveller status. The client only ever receives *FileName (the file
 * itself lives behind an authorized endpoint), so display is derived from the
 * names — the server remains the authority via `isFlightRecordComplete`,
 * which checks the stored *FilePath.
 */
type MemberStatus =
  | "notStarted"
  | "detailsSaved"
  | "passportMissing"
  | "ticketMissing"
  | "complete";

function memberStatus(flight: FlightRecord | undefined): MemberStatus {
  if (!flight) return "notStarted";
  const hasPassport = !!flight.passportFileName;
  const hasTicket = !!flight.ticketFileName;
  if (hasPassport && hasTicket) return "complete";
  if (!hasPassport && !hasTicket) return "detailsSaved";
  return hasPassport ? "ticketMissing" : "passportMissing";
}

const STATUS_TONE: Record<MemberStatus, string> = {
  notStarted: "pp-badge--neutral",
  detailsSaved: "pp-badge--warning",
  passportMissing: "pp-badge--warning",
  ticketMissing: "pp-badge--warning",
  complete: "pp-badge--success",
};

/** Document tile — icon square, name + "PDF · 2.4 MB", View PDF button. */
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
 * Flight information — ONE record per roster member. Every traveller flies on
 * their own passport and ticket, so the roster is rendered as a list of rows
 * and each row owns its own form, its own busy flag and its own error. Rows
 * save one at a time (never a parallel N-upload burst) and a failure on one
 * row leaves every other row's typed data untouched.
 *
 * Legacy team-level rows (teamMemberId = null, submitted before details were
 * filed per traveller) are surfaced in an "Unlinked" section where they can be
 * adopted by a roster member instead of being silently dropped.
 */
export function FlightDetailsManager({
  initialFlights,
  members,
  canEdit,
  finalized,
  deadlineIso,
  deadlinePassed,
}: {
  initialFlights: FlightRecord[];
  members: TeamMemberRecord[];
  canEdit: boolean;
  finalized: boolean;
  deadlineIso: string | null;
  deadlinePassed: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const fl = t.flights;
  const dateTag = DATE_TAG[locale];

  const [flights, setFlights] = useState<FlightRecord[]>(initialFlights);
  /** Roster member id whose form is open (only one row edits at a time). */
  const [editingId, setEditingId] = useState<string | null>(null);
  /** Row currently talking to the server — keyed by member id or flight id. */
  const [busyId, setBusyId] = useState<string | null>(null);
  /** Per-row error, so a failure on one row never disturbs another. */
  const [errorsById, setErrorsById] = useState<Record<string, string>>({});
  /** Per-row drafts, kept keyed by member id so typed data survives a failure. */
  const [formsById, setFormsById] = useState<Record<string, FormState>>({});
  /** Two-step delete confirmation, keyed by flight id. */
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  /** Roster member picked for each unlinked record, keyed by flight id. */
  const [adoptById, setAdoptById] = useState<Record<string, string>>({});

  const editable = canEdit && !finalized && !deadlinePassed;

  const byMember = useMemo(
    () =>
      new Map(
        flights
          .filter((f) => f.teamMemberId)
          .map((f) => [f.teamMemberId as string, f])
      ),
    [flights]
  );

  const unlinked = useMemo(
    () => flights.filter((f) => !f.teamMemberId),
    [flights]
  );

  /** Members still free to adopt an unlinked record. */
  const adoptable = useMemo(
    () => members.filter((m) => !byMember.has(m.id)),
    [members, byMember]
  );

  const completeCount = useMemo(
    () =>
      members.filter((m) => memberStatus(byMember.get(m.id)) === "complete")
        .length,
    [members, byMember]
  );

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

  const statusLabel: Record<MemberStatus, string> = {
    notStarted: fl.status.notStarted,
    detailsSaved: fl.status.detailsSaved,
    passportMissing: fl.status.passportMissing,
    ticketMissing: fl.status.ticketMissing,
    complete: fl.status.complete,
  };

  const apiError = async (res: Response) => {
    const data = await res.json().catch(() => ({}));
    if (data.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (typeof first === "string") return first;
    }
    return typeof data.error === "string" ? data.error : TOAST.GENERIC_ERROR;
  };

  const setRowError = (key: string, message: string | null) =>
    setErrorsById((prev) => {
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });

  /** The live draft for a member — seeded from their record, or their name. */
  const draftFor = (member: TeamMemberRecord): FormState =>
    formsById[member.id] ?? {
      passengerName:
        byMember.get(member.id)?.passengerName ?? member.fullName ?? "",
      passportNumber: byMember.get(member.id)?.passportNumber ?? "",
      passportFile: null,
      ticketFile: null,
    };

  const patchDraft = (member: TeamMemberRecord, patch: Partial<FormState>) =>
    setFormsById((prev) => ({
      ...prev,
      [member.id]: { ...draftFor(member), ...patch },
    }));

  const dropDraft = (memberId: string) =>
    setFormsById((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });

  const openEditor = (member: TeamMemberRecord) => {
    setRowError(member.id, null);
    // Seed the draft only if the row has none — an earlier failure's typed
    // data must survive reopening the row.
    setFormsById((prev) =>
      prev[member.id] ? prev : { ...prev, [member.id]: draftFor(member) }
    );
    setEditingId(member.id);
  };

  const closeEditor = (memberId: string) => {
    setRowError(memberId, null);
    dropDraft(memberId);
    setEditingId((prev) => (prev === memberId ? null : prev));
  };

  /** Client-side gate mirroring the server's accepted uploads. */
  const validate = (form: FormState): string | null => {
    if (!form.passengerName.trim()) return fl.errors.nameRequired;
    if (form.passportNumber.trim().length < 3) return fl.errors.passportRequired;
    for (const [file, label] of [
      [form.passportFile, fl.errors.passportLabel],
      [form.ticketFile, fl.errors.ticketLabel],
    ] as const) {
      if (file && !isPdf(file)) return fl.errors.mustBePdf(label);
      if (file && file.size > MAX_UPLOAD_BYTES)
        return fl.errors.mustBeUnder10(label);
    }
    return null;
  };

  /** Replace one record in place (or append it) — never touches other rows. */
  const upsertFlight = (saved: FlightRecord) =>
    setFlights((prev) => {
      const idx = prev.findIndex((f) => f.id === saved.id);
      if (idx === -1) return [...prev, saved];
      const next = [...prev];
      next[idx] = saved;
      return next;
    });

  /* ——— One row at a time: create or update a member's flight record ——— */
  const saveMember = async (member: TeamMemberRecord) => {
    if (busyId) return;
    const form = draftFor(member);
    const invalid = validate(form);
    if (invalid) {
      setRowError(member.id, invalid);
      toast.error(invalid);
      return;
    }

    const existing = byMember.get(member.id);
    const fd = new FormData();
    fd.set("teamMemberId", member.id);
    fd.set("passengerName", form.passengerName.trim());
    fd.set("passportNumber", form.passportNumber.trim());
    if (form.passportFile) fd.set("passport", form.passportFile);
    if (form.ticketFile) fd.set("ticket", form.ticketFile);

    setBusyId(member.id);
    setRowError(member.id, null);
    try {
      const res = await fetch(
        existing ? `/api/user/flights/${existing.id}` : "/api/user/flights",
        { method: existing ? "PUT" : "POST", body: fd }
      );
      if (!res.ok) {
        const message = await apiError(res);
        setRowError(member.id, message);
        toast.error(message);
        return;
      }
      const { flight: saved } = (await res.json()) as { flight: FlightRecord };
      upsertFlight(saved);
      closeEditor(member.id);
      toast.success(existing ? fl.errors.updated : fl.errors.submitted);
      router.refresh();
    } catch {
      setRowError(member.id, TOAST.GENERIC_ERROR);
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusyId(null);
    }
  };

  const deleteFlight = async (flightId: string, rowKey: string) => {
    if (busyId) return;
    setBusyId(rowKey);
    setRowError(rowKey, null);
    try {
      const res = await fetch(`/api/user/flights/${flightId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const message = await apiError(res);
        setRowError(rowKey, message);
        toast.error(message);
        return;
      }
      setFlights((prev) => prev.filter((f) => f.id !== flightId));
      setConfirmDeleteId(null);
      toast.success(fl.member.deleted);
      router.refresh();
    } catch {
      setRowError(rowKey, TOAST.GENERIC_ERROR);
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusyId(null);
    }
  };

  /* ——— Adopt a legacy team-level record into a roster member ——— */
  const adoptFlight = async (flight: FlightRecord) => {
    if (busyId) return;
    const memberId = adoptById[flight.id];
    if (!memberId) {
      setRowError(flight.id, fl.unlinked.selectRequired);
      toast.error(fl.unlinked.selectRequired);
      return;
    }

    const fd = new FormData();
    fd.set("teamMemberId", memberId);
    fd.set("passengerName", flight.passengerName);
    fd.set("passportNumber", flight.passportNumber);

    setBusyId(flight.id);
    setRowError(flight.id, null);
    try {
      const res = await fetch(`/api/user/flights/${flight.id}`, {
        method: "PUT",
        body: fd,
      });
      if (!res.ok) {
        const message = await apiError(res);
        setRowError(flight.id, message);
        toast.error(message);
        return;
      }
      const { flight: saved } = (await res.json()) as { flight: FlightRecord };
      upsertFlight(saved);
      setAdoptById((prev) => {
        const next = { ...prev };
        delete next[flight.id];
        return next;
      });
      toast.success(fl.unlinked.assigned);
      router.refresh();
    } catch {
      setRowError(flight.id, TOAST.GENERIC_ERROR);
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusyId(null);
    }
  };

  /* ——————————————————————— rendering ——————————————————————— */

  const docsGrid = (flight: FlightRecord) => (
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
  );

  const memberRow = (member: TeamMemberRecord, index: number) => {
    const flight = byMember.get(member.id);
    const status = memberStatus(flight);
    const isEditing = editable && editingId === member.id;
    const busy = busyId === member.id;
    const rowError = errorsById[member.id];
    const form = draftFor(member);
    const confirming = !!flight && confirmDeleteId === flight.id;

    return (
      <li
        key={member.id}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[0.8125rem] font-bold text-slate-500"
              aria-hidden
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="m-0 truncate text-[0.9375rem] font-bold leading-tight text-slate-900">
                {member.fullName}
              </p>
              <p className="m-0 mt-0.5 truncate text-[0.78rem] text-slate-500">
                {[member.rank, member.serviceNumber]
                  .filter(Boolean)
                  .join(" · ") || fl.none}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`pp-badge ${STATUS_TONE[status]}`}>
              {status === "complete" ? (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              ) : status === "notStarted" ? (
                <UserRound className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              )}
              {statusLabel[status]}
            </span>

            {editable && !isEditing ? (
              <button
                type="button"
                className="pp-btn pp-btn--ghost"
                disabled={busyId !== null}
                onClick={() => openEditor(member)}
              >
                {flight ? (
                  <Pencil className="h-4 w-4" aria-hidden />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden />
                )}
                {flight ? fl.member.editDetails : fl.member.addDetails}
              </button>
            ) : null}
          </div>
        </div>

        {rowError ? (
          <p className="m-0 border-t border-red-100 bg-red-50 px-4 py-2.5 text-[0.8125rem] font-medium text-red-700">
            {rowError}
          </p>
        ) : null}

        {isEditing ? (
          <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`fd-name-${member.id}`} className="pp-label">
                  {fl.form.passengerName}
                </label>
                <Input
                  id={`fd-name-${member.id}`}
                  value={form.passengerName}
                  onChange={(e) =>
                    patchDraft(member, { passengerName: e.target.value })
                  }
                  placeholder={fl.form.passengerNamePlaceholder}
                  disabled={busy}
                />
              </div>
              <div>
                <label htmlFor={`fd-passport-no-${member.id}`} className="pp-label">
                  {fl.form.passportNumber}
                </label>
                <Input
                  id={`fd-passport-no-${member.id}`}
                  value={form.passportNumber}
                  onChange={(e) =>
                    patchDraft(member, { passportNumber: e.target.value })
                  }
                  placeholder={fl.form.passportNumberPlaceholder}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`fd-passport-file-${member.id}`}
                  className="pp-label"
                >
                  {fl.form.passportDoc}
                </label>
                <input
                  id={`fd-passport-file-${member.id}`}
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={busy}
                  onChange={(e) =>
                    patchDraft(member, {
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
                <label
                  htmlFor={`fd-ticket-file-${member.id}`}
                  className="pp-label"
                >
                  {fl.form.ticketDoc}
                </label>
                <input
                  id={`fd-ticket-file-${member.id}`}
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={busy}
                  onChange={(e) =>
                    patchDraft(member, {
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
                disabled={busyId !== null}
                onClick={() => saveMember(member)}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                )}
                {flight ? fl.form.saveChanges : fl.form.submitFlight}
              </button>
              <button
                type="button"
                className="pp-btn pp-btn--ghost"
                disabled={busyId !== null}
                onClick={() => closeEditor(member.id)}
              >
                {fl.form.cancel}
              </button>
            </div>
          </div>
        ) : flight ? (
          <div className="space-y-4 border-t border-slate-100 px-4 py-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="m-0 text-[0.75rem] font-medium text-slate-500">
                  {fl.view.passenger}
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

            {docsGrid(flight)}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="m-0 text-[0.75rem] text-slate-500">
                {fl.view.lastUpdated}:{" "}
                <span className="font-semibold text-slate-700">
                  {fmtDateTime(flight.updatedAt, dateTag)}
                </span>
              </p>
              {editable ? (
                confirming ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.8125rem] font-semibold text-red-700">
                      {fl.member.confirmDelete}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={busyId !== null}
                      onClick={() => deleteFlight(flight.id, member.id)}
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {fl.member.confirmDeleteYes}
                    </button>
                    <button
                      type="button"
                      className="pp-btn pp-btn--ghost"
                      disabled={busyId !== null}
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      {fl.member.keep}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={busyId !== null}
                    onClick={() => setConfirmDeleteId(flight.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    {fl.member.delete}
                  </button>
                )
              ) : null}
            </div>
          </div>
        ) : (
          <p className="m-0 border-t border-slate-100 px-4 py-3 text-[0.8125rem] text-slate-500">
            {fl.member.noRecord}
          </p>
        )}
      </li>
    );
  };

  const unlinkedRow = (flight: FlightRecord) => {
    const busy = busyId === flight.id;
    const rowError = errorsById[flight.id];
    const confirming = confirmDeleteId === flight.id;

    return (
      <li
        key={flight.id}
        className="overflow-hidden rounded-xl border border-amber-200 bg-white"
      >
        <div className="grid gap-5 border-b border-slate-100 px-4 py-3.5 sm:grid-cols-2">
          <div>
            <p className="m-0 text-[0.75rem] font-medium text-slate-500">
              {fl.view.passenger}
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

        <div className="space-y-4 px-4 py-4">
          {docsGrid(flight)}

          {rowError ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.8125rem] font-medium text-red-700">
              {rowError}
            </p>
          ) : null}

          {editable ? (
            <div className="flex flex-wrap items-center gap-2">
              {/* The adopt picker disappears once every roster member already
                  has their own record — but the row must STAY deletable, or a
                  leftover team-level record is stuck on the page forever. */}
              {adoptable.length === 0 ? (
                <p className="m-0 mr-1 text-[0.8125rem] text-slate-500">
                  {fl.unlinked.noneAvailable}
                </p>
              ) : (
                <>
                  <select
                    value={adoptById[flight.id] ?? ""}
                    disabled={busyId !== null}
                    aria-label={fl.unlinked.selectMember}
                    onChange={(e) =>
                      setAdoptById((prev) => ({
                        ...prev,
                        [flight.id]: e.target.value,
                      }))
                    }
                    className="h-10 min-w-[14rem] rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">{fl.unlinked.selectMember}</option>
                    {adoptable.map((m) => (
                      <option key={m.id} value={m.id}>
                        {[m.rank, m.fullName].filter(Boolean).join(" ")}
                        {m.serviceNumber ? ` · ${m.serviceNumber}` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="pp-btn pp-btn--primary"
                    disabled={busyId !== null}
                    onClick={() => adoptFlight(flight)}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Link2 className="h-4 w-4" aria-hidden />
                    )}
                    {fl.unlinked.assign}
                  </button>
                </>
              )}

              {confirming ? (
                <>
                  <span className="text-[0.8125rem] font-semibold text-red-700">
                    {fl.member.confirmDelete}
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={busyId !== null}
                    onClick={() => deleteFlight(flight.id, flight.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    {fl.member.confirmDeleteYes}
                  </button>
                  <button
                    type="button"
                    className="pp-btn pp-btn--ghost"
                    disabled={busyId !== null}
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    {fl.member.keep}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={busyId !== null}
                  onClick={() => setConfirmDeleteId(flight.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  {fl.member.delete}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </li>
    );
  };

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
            className={`pp-badge ${
              members.length > 0 && completeCount === members.length
                ? "pp-badge--success"
                : "pp-badge--neutral"
            }`}
          >
            {members.length > 0 && completeCount === members.length ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            ) : null}
            {fl.card.progress(completeCount, members.length)}
          </span>
        </div>

        {members.length === 0 ? (
          <p className="m-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[0.8125rem] leading-relaxed text-slate-600">
            {fl.card.emptyRoster}
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {members.map((member, i) => memberRow(member, i))}
          </ul>
        )}
      </section>

      {unlinked.length > 0 ? (
        <section className="pp-card">
          <div className="pp-card__head">
            <div className="flex min-w-0 items-start gap-3.5">
              <span
                className="mt-0.5 flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700"
                aria-hidden
              >
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="pp-card__title">{fl.unlinked.title}</h2>
                <p className="pp-card__desc" style={{ marginTop: "0.2rem" }}>
                  {fl.unlinked.desc}
                </p>
              </div>
            </div>
          </div>

          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {unlinked.map((flight) => unlinkedRow(flight))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
