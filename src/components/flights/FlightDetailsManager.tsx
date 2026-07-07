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
  Plane,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TOAST } from "@/lib/toast";

export type RosterMemberOption = {
  id: string;
  fullName: string;
  rank: string;
  serviceNumber: string;
};

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
  teamMemberId: string;
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

function DocChip({
  uploaded,
  href,
  label,
}: {
  uploaded: boolean;
  href: string;
  label: string;
}) {
  if (!uploaded) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
        <FileUp className="h-3.5 w-3.5" aria-hidden />
        Missing
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
      title={`Open ${label} PDF`}
    >
      <FileCheck2 className="h-3.5 w-3.5" aria-hidden />
      View PDF
    </a>
  );
}

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" && /\.pdf$/i.test(file.name)
  );
}

/**
 * Flight information module: one record per traveler with Passport (PDF)
 * and Flight Ticket (PDF) attachments, editable until the deadline or
 * administrative finalization.
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
  members: RosterMemberOption[];
  canEdit: boolean;
  finalized: boolean;
  deadlineIso: string | null;
  deadlinePassed: boolean;
}) {
  const router = useRouter();
  const [flights, setFlights] = useState<FlightRecord[]>(initialFlights);
  const [busy, setBusy] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    teamMemberId: "",
    passengerName: "",
    passportNumber: "",
    passportFile: null,
    ticketFile: null,
  });

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  );
  const coveredMemberIds = useMemo(
    () =>
      new Set(
        flights
          .map((f) => f.teamMemberId)
          .filter((id): id is string => !!id)
      ),
    [flights]
  );
  const availableMembers = useMemo(
    () =>
      members.filter(
        (m) => !coveredMemberIds.has(m.id) || m.id === form.teamMemberId
      ),
    [members, coveredMemberIds, form.teamMemberId]
  );

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

  const openCreate = () => {
    const firstFree = members.find((m) => !coveredMemberIds.has(m.id));
    setEditingId(null);
    setForm({
      teamMemberId: firstFree?.id ?? "",
      passengerName: firstFree?.fullName ?? "",
      passportNumber: "",
      passportFile: null,
      ticketFile: null,
    });
    setFormOpen(true);
  };

  const openEdit = (f: FlightRecord) => {
    setEditingId(f.id);
    setForm({
      teamMemberId: f.teamMemberId ?? "",
      passengerName: f.passengerName,
      passportNumber: f.passportNumber,
      passportFile: null,
      ticketFile: null,
    });
    setFormOpen(true);
  };

  const onPickMember = (id: string) => {
    const m = memberById.get(id);
    setForm((prev) => ({
      ...prev,
      teamMemberId: id,
      passengerName:
        prev.passengerName.trim().length === 0 ||
        members.some((mm) => mm.fullName === prev.passengerName)
          ? (m?.fullName ?? prev.passengerName)
          : prev.passengerName,
    }));
  };

  const apiError = async (res: Response) => {
    const data = await res.json().catch(() => ({}));
    if (data.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (typeof first === "string") return first;
    }
    return typeof data.error === "string" ? data.error : TOAST.GENERIC_ERROR;
  };

  const submit = async () => {
    if (!form.teamMemberId) {
      toast.error("Select the traveler");
      return;
    }
    if (!form.passengerName.trim()) {
      toast.error("Passenger name is required");
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
    fd.set("teamMemberId", form.teamMemberId);
    fd.set("passengerName", form.passengerName.trim());
    fd.set("passportNumber", form.passportNumber.trim());
    if (form.passportFile) fd.set("passport", form.passportFile);
    if (form.ticketFile) fd.set("ticket", form.ticketFile);

    setBusy("save");
    try {
      const res = await fetch(
        editingId ? `/api/user/flights/${editingId}` : "/api/user/flights",
        { method: editingId ? "PUT" : "POST", body: fd }
      );
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      const { flight } = (await res.json()) as { flight: FlightRecord };
      setFlights((prev) =>
        editingId
          ? prev.map((f) => (f.id === editingId ? flight : f))
          : [...prev, flight]
      );
      setFormOpen(false);
      toast.success(
        editingId ? "Flight details updated" : "Flight details added"
      );
      router.refresh();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setBusy(`delete-${id}`);
    try {
      const res = await fetch(`/api/user/flights/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      setFlights((prev) => prev.filter((f) => f.id !== id));
      toast.success("Flight record removed");
      router.refresh();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusy(null);
    }
  };

  const missingCount = members.length - coveredMemberIds.size;

  return (
    <div className="space-y-4">
      {finalized ? (
        <div className="portal-alert-success flex items-start gap-2 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Your flight details have been reviewed and finalized by the
          administration. Records are read-only. The Host Information section
          is available once published by the organizers.
        </div>
      ) : deadlinePassed ? (
        <div className="portal-alert-error flex items-start gap-2 rounded-lg px-4 py-3 text-sm">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          The flight details submission deadline has passed. Contact the
          organizers if corrections are required.
        </div>
      ) : deadlineLabel ? (
        <div className="portal-alert-info flex items-start gap-2 rounded-lg px-4 py-3 text-sm">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          You can add, edit, or replace documents until {deadlineLabel} (or
          until records are locked by the administration).
        </div>
      ) : null}

      <section className="portal-card pats-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="portal-h2 mb-0.5">Traveler Flight Information</h2>
            <p className="text-sm text-slate-600">
              {flights.length} of {members.length} travelers covered
              {missingCount > 0 && canEdit
                ? ` · ${missingCount} remaining`
                : ""}
            </p>
          </div>
          {canEdit ? (
            <Button
              size="sm"
              className="bg-emerald-700 text-white hover:bg-emerald-800"
              onClick={openCreate}
              disabled={busy !== null || missingCount === 0}
              title={
                missingCount === 0
                  ? "All roster members already have flight records"
                  : "Add flight details for a traveler"
              }
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add flight details
            </Button>
          ) : null}
        </div>

        {flights.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center">
            <Plane className="h-8 w-8 text-slate-400" aria-hidden />
            <p className="text-sm text-slate-600">
              No flight details submitted yet.
              {canEdit
                ? " Add each traveler's passport and ticket documents."
                : ""}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">
                Flight details per traveler with document status
              </caption>
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-3 py-2.5">
                    Traveler
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Passenger Name
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Passport No.
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Passport (PDF)
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Ticket (PDF)
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Last Updated
                  </th>
                  {canEdit ? (
                    <th scope="col" className="w-24 px-3 py-2.5 text-right">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {flights.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2.5">
                      {f.teamMember ? (
                        <div>
                          <p className="font-medium text-slate-800">
                            {f.teamMember.rank
                              ? `${f.teamMember.rank} ${f.teamMember.fullName}`
                              : f.teamMember.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {f.teamMember.serviceNumber}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unlinked</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-800">
                      {f.passengerName}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-700">
                      {f.passportNumber}
                    </td>
                    <td className="px-3 py-2.5">
                      <DocChip
                        uploaded={!!f.passportFileName}
                        href={`/api/user/flights/${f.id}/file?type=passport`}
                        label="passport"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <DocChip
                        uploaded={!!f.ticketFileName}
                        href={`/api/user/flights/${f.id}/file?type=ticket`}
                        label="ticket"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">
                      {fmtDateTime(f.updatedAt)}
                    </td>
                    {canEdit ? (
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-slate-600 hover:text-emerald-700"
                            disabled={busy !== null}
                            onClick={() => openEdit(f)}
                            aria-label={`Edit flight details for ${f.passengerName}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </Button>
                          <ConfirmDialog
                            trigger={
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-slate-600 hover:text-red-700"
                                disabled={busy !== null}
                                aria-label={`Remove flight record for ${f.passengerName}`}
                              >
                                {busy === `delete-${f.id}` ? (
                                  <Loader2
                                    className="h-4 w-4 animate-spin"
                                    aria-hidden
                                  />
                                ) : (
                                  <Trash2 className="h-4 w-4" aria-hidden />
                                )}
                              </Button>
                            }
                            title="Remove flight record"
                            description={`Remove the flight record and uploaded documents for ${f.passengerName}?`}
                            confirmLabel="Remove"
                            onConfirm={() => remove(f.id)}
                          />
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit flight details" : "Add flight details"}
            </DialogTitle>
            <DialogDescription>
              Attach the traveler&apos;s passport and flight ticket as PDF
              files (max 10MB each). Documents can be replaced until the
              deadline or administrative lock.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div>
              <label
                htmlFor="fd-member"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Traveler (from your roster)
              </label>
              <select
                id="fd-member"
                value={form.teamMemberId}
                onChange={(e) => onPickMember(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  Select traveler…
                </option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.rank ? `${m.rank} ` : ""}
                    {m.fullName} ({m.serviceNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="fd-name"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Passenger name (as on passport)
              </label>
              <Input
                id="fd-name"
                value={form.passengerName}
                onChange={(e) =>
                  setForm({ ...form, passengerName: e.target.value })
                }
                placeholder="e.g. SARA KHAN"
              />
            </div>

            <div>
              <label
                htmlFor="fd-passport-no"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Passport number
              </label>
              <Input
                id="fd-passport-no"
                value={form.passportNumber}
                onChange={(e) =>
                  setForm({ ...form, passportNumber: e.target.value })
                }
                placeholder="e.g. AB1234567"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fd-passport-file"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Passport (PDF)
                </label>
                <input
                  id="fd-passport-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      passportFile: e.target.files?.[0] ?? null,
                    })
                  }
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {editingId ? (
                  <p className="mt-1 text-xs text-slate-500">
                    <FileText className="mr-1 inline h-3 w-3" aria-hidden />
                    Leave empty to keep the current file.
                  </p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="fd-ticket-file"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Flight Ticket (PDF)
                </label>
                <input
                  id="fd-ticket-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ticketFile: e.target.files?.[0] ?? null,
                    })
                  }
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {editingId ? (
                  <p className="mt-1 text-xs text-slate-500">
                    <FileText className="mr-1 inline h-3 w-3" aria-hidden />
                    Leave empty to keep the current file.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-700 text-white hover:bg-emerald-800"
              disabled={busy !== null}
              onClick={submit}
            >
              {busy === "save" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {editingId ? "Save changes" : "Add traveler"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
