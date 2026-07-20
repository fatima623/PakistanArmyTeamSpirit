"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Lock,
  Pencil,
  Save,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiErrorMessage } from "@/lib/i18n/api-error-i18n";
import type { TeamMemberRecord } from "@/lib/team-members";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/config";

const DATE_TAG: Record<Locale, string> = {
  en: "en-GB",
  ru: "ru-RU",
  tr: "tr-TR",
  ar: "ar",
  zh: "zh-CN",
};

type WindowState = "open" | "before" | "closed";

type SizeRequest = {
  id: string;
  requestedCount: number;
  status: string;
  reviewNote: string | null;
  createdAt: string;
};

/** One editable roster line. `id` is null until the row is persisted. */
type Row = {
  id: string | null;
  serviceNumber: string;
  rank: string;
  fullName: string;
  serviceArm: string;
  gender: string;
};

const GENDERS = ["Male", "Female", "Other"] as const;

const emptyRow = (): Row => ({
  id: null,
  serviceNumber: "",
  rank: "",
  fullName: "",
  serviceArm: "",
  gender: "Male",
});

function memberToRow(m: TeamMemberRecord): Row {
  return {
    id: m.id,
    serviceNumber: m.serviceNumber,
    rank: m.rank,
    fullName: m.fullName,
    serviceArm: m.serviceArm,
    gender: m.gender || "Male",
  };
}

/** A fixed grid of `limit` rows, pre-filled with any saved members. */
function buildRows(members: TeamMemberRecord[], limit: number): Row[] {
  const count = Math.max(limit, members.length);
  return Array.from({ length: count }, (_, i) =>
    members[i] ? memberToRow(members[i]) : emptyRow()
  );
}

const isRowBlank = (r: Row) =>
  !r.serviceNumber.trim() && !r.rank.trim() && !r.fullName.trim();

type RowErrorCode = "serial" | "rank" | "fullName" | null;

const rowError = (r: Row): RowErrorCode => {
  if (isRowBlank(r)) return null;
  if (!r.serviceNumber.trim()) return "serial";
  if (!r.rank.trim()) return "rank";
  if (!r.fullName.trim()) return "fullName";
  return null;
};

const rowChanged = (m: TeamMemberRecord, r: Row) =>
  m.serviceNumber !== r.serviceNumber.trim() ||
  m.rank !== r.rank.trim() ||
  m.fullName !== r.fullName.trim() ||
  (m.serviceArm ?? "") !== r.serviceArm.trim() ||
  m.gender !== r.gender;

const rowBody = (r: Row) => ({
  fullName: r.fullName.trim(),
  serviceNumber: r.serviceNumber.trim(),
  rank: r.rank.trim(),
  serviceArm: r.serviceArm.trim(),
  gender: r.gender,
});

function fmt(dateIso: string | null, tag: string): string | null {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(tag, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Team registration + roster.
 *
 * The roster is a fixed grid of `limit` editable rows (serial number, rank,
 * full name, gender) — fill them in and press “Save roster”. Save diffs the
 * grid against what is persisted and creates / updates / deletes rows through
 * the existing per-member endpoints, so member ids (and their linked flight
 * details) are preserved across edits. The cap can be raised via the
 * “Request Additional Team Members” flow.
 */
export function TeamRosterManager({
  initialMembers,
  teamRegistered,
  rosterCompleted: initialRosterCompleted,
  flightsFinalized,
  canRegister,
  windowState,
  windowOpenIso,
  windowCloseIso,
  limit,
  latestRequest,
  hideHeading = false,
}: {
  initialMembers: TeamMemberRecord[];
  teamRegistered: boolean;
  rosterCompleted: boolean;
  flightsFinalized: boolean;
  canRegister: boolean;
  windowState: WindowState;
  windowOpenIso: string | null;
  windowCloseIso: string | null;
  limit: number;
  latestRequest: SizeRequest | null;
  /** Hide the in-card heading when the page already renders one (wizard). */
  hideHeading?: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const tm = t.team;
  const dateTag = DATE_TAG[locale];
  const genderLabels: Record<string, string> = {
    Male: tm.genders.male,
    Female: tm.genders.female,
    Other: tm.genders.other,
  };
  const [members, setMembers] = useState<TeamMemberRecord[]>(initialMembers);
  const [rows, setRows] = useState<Row[]>(() =>
    buildRows(initialMembers, limit)
  );
  const [rosterCompleted, setRosterCompleted] = useState(
    initialRosterCompleted
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestedCount, setRequestedCount] = useState(limit + 1);
  const [justification, setJustification] = useState("");
  const [sizeRequest, setSizeRequest] = useState<SizeRequest | null>(
    latestRequest
  );

  /* Completed rosters are read-only (view details only) until reopened. */
  const canEdit = teamRegistered && !flightsFinalized && !rosterCompleted;
  const filledCount = rows.filter((r) => !isRowBlank(r)).length;
  /** Every roster row fully filled — required before Save is enabled. */
  const allFilled = rows.every((r) => !isRowBlank(r) && !rowError(r));
  const dirty = useMemo(
    () => JSON.stringify(buildRows(members, limit)) !== JSON.stringify(rows),
    [members, rows, limit]
  );

  const windowLabel = useMemo(() => {
    const open = fmt(windowOpenIso, dateTag);
    const close = fmt(windowCloseIso, dateTag);
    if (windowState === "before") {
      return open ? tm.window.opensOn(open) : tm.window.notOpenedYet;
    }
    if (windowState === "closed") {
      return close ? tm.window.closedOn(close) : tm.window.periodClosed;
    }
    if (close) return tm.window.openUntil(close);
    return tm.window.open;
  }, [windowState, windowOpenIso, windowCloseIso, dateTag, tm]);

  const apiError = async (res: Response) => {
    const data = await res.json().catch(() => ({}));
    if (data.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (typeof first === "string") return first;
    }
    return apiErrorMessage(data, locale, t.common.toasts.genericError);
  };

  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );

  /** Empty a row's fields but keep its id, so Save removes it server-side. */
  const clearRow = (index: number) =>
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...emptyRow(), id: r.id } : r))
    );

  /** Re-sync the grid from the server (used to recover from a failed save). */
  const reload = async () => {
    try {
      const res = await fetch("/api/user/team-members");
      if (!res.ok) return;
      const { teamMembers } = (await res.json()) as {
        teamMembers: TeamMemberRecord[];
      };
      setMembers(teamMembers);
      setRows(buildRows(teamMembers, limit));
    } catch {
      /* leave local state as-is */
    }
  };

  const registerTeam = async () => {
    setBusy("register");
    try {
      const res = await fetch("/api/user/team-registration", {
        method: "POST",
      });
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      toast.success(tm.toasts.teamRegistered);
      router.refresh();
    } catch {
      toast.error(t.common.toasts.genericError);
    } finally {
      setBusy(null);
    }
  };

  /* Registration happens implicitly — when the window is open the roster is
     shown directly instead of an interstitial “Register Team” screen. */
  const autoRegisterAttempted = useRef(false);
  useEffect(() => {
    if (!teamRegistered && canRegister && !autoRegisterAttempted.current) {
      autoRegisterAttempted.current = true;
      void registerTeam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamRegistered, canRegister]);

  /**
   * Persist the grid. Deletes cleared members first (frees the cap), then
   * walks the rows in order applying updates / creates so the saved order
   * matches what the participant sees.
   */
  const saveRoster = async (): Promise<boolean> => {
    const errMsg: Record<Exclude<RowErrorCode, null>, string> = {
      serial: tm.errors.serialRequired,
      rank: tm.errors.rankRequired,
      fullName: tm.errors.fullNameRequired,
    };
    for (let i = 0; i < rows.length; i++) {
      const err = rowError(rows[i]);
      if (err) {
        toast.error(tm.errors.rowError(i + 1, errMsg[err]));
        return false;
      }
    }

    const seen = new Set<string>();
    for (const r of rows) {
      if (isRowBlank(r)) continue;
      const key = r.serviceNumber.trim().toLowerCase();
      if (seen.has(key)) {
        toast.error(tm.errors.duplicateSerial(r.serviceNumber.trim()));
        return false;
      }
      seen.add(key);
    }

    setBusy("save");
    try {
      // 1 — remove members whose row was cleared
      for (const m of members) {
        const row = rows.find((r) => r.id === m.id);
        if (!row || isRowBlank(row)) {
          const res = await fetch(`/api/user/team-members/${m.id}`, {
            method: "DELETE",
          });
          if (!res.ok && res.status !== 404) {
            throw new Error(await apiError(res));
          }
        }
      }

      // 2 — create / update in visual order
      const next: TeamMemberRecord[] = [];
      for (const row of rows) {
        if (isRowBlank(row)) continue;
        if (row.id) {
          const prev = members.find((m) => m.id === row.id);
          if (prev && !rowChanged(prev, row)) {
            next.push(prev);
            continue;
          }
          const res = await fetch(`/api/user/team-members/${row.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rowBody(row)),
          });
          if (!res.ok) throw new Error(await apiError(res));
          const { teamMember } = (await res.json()) as {
            teamMember: TeamMemberRecord;
          };
          next.push(teamMember);
        } else {
          const res = await fetch("/api/user/team-members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rowBody(row)),
          });
          if (!res.ok) throw new Error(await apiError(res));
          const { teamMember } = (await res.json()) as {
            teamMember: TeamMemberRecord;
          };
          next.push(teamMember);
        }
      }

      setMembers(next);
      setRows(buildRows(next, limit));
      toast.success(tm.toasts.rosterSaved);
      router.refresh();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.common.toasts.genericError);
      await reload();
      return false;
    } finally {
      setBusy(null);
    }
  };

  const setComplete = async (complete: boolean): Promise<boolean> => {
    setBusy("complete");
    try {
      const res = await fetch("/api/user/team-roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complete }),
      });
      if (!res.ok) {
        toast.error(await apiError(res));
        return false;
      }
      setRosterCompleted(complete);
      toast.success(
        complete ? tm.toasts.rosterCompleted : tm.toasts.rosterReopened
      );
      router.refresh();
      return true;
    } catch {
      toast.error(t.common.toasts.genericError);
      return false;
    } finally {
      setBusy(null);
    }
  };

  /** Enabled only once the saved roster is complete (all rows filled, no
   *  unsaved edits) — per the guided flow: fill → Save → Mark complete. */
  const markComplete = async () => {
    if (dirty || !allFilled) return;
    await setComplete(true);
  };

  /** Bottom "Next step" — marks the roster complete (if needed) then jumps
   *  straight to the Flight Details step, skipping sidebar navigation. */
  const goToFlights = async () => {
    if (busy !== null || !allFilled || dirty) return;
    if (!rosterCompleted) {
      const ok = await setComplete(true);
      if (!ok) return;
    }
    router.push("/event/journey?step=flights");
  };

  const submitSizeRequest = async () => {
    setBusy("request");
    try {
      const res = await fetch("/api/user/team-size-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedCount, justification }),
      });
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      const { request } = (await res.json()) as { request: SizeRequest };
      setSizeRequest(request);
      setRequestOpen(false);
      setJustification("");
      toast.success(tm.toasts.requestSubmitted);
    } catch {
      toast.error(t.common.toasts.genericError);
    } finally {
      setBusy(null);
    }
  };

  /* ---------------- not yet registered ---------------- */
  if (!teamRegistered) {
    // Window open → registration is performed automatically (no interstitial
    // “Register Team” screen); show a brief setup state while it completes.
    if (canRegister) {
      return (
        <section className="portal-card pats-panel">
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <Loader2
              className="h-7 w-7 animate-spin text-emerald-700"
              aria-hidden
            />
            <p className="m-0 text-sm font-semibold text-slate-700">
              {tm.settingUp}
            </p>
            <p className="m-0 text-xs text-slate-500">{windowLabel}</p>
          </div>
        </section>
      );
    }
    return (
      <section className="portal-card pats-panel">
        <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
            <Users className="h-7 w-7 text-emerald-700" aria-hidden />
          </span>
          <div>
            <p className="mx-auto max-w-md text-sm text-slate-600">
              {windowLabel}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${
              windowState === "open"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
            }`}
          >
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            {windowState === "open"
              ? tm.register.windowOpen
              : windowState === "before"
                ? tm.register.windowNotYetOpen
                : tm.register.windowClosed}
          </div>
          {windowState === "open" ? (
            <p className="text-xs text-slate-500">
              {tm.register.unlockNote}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  /* ---------------- roster grid ---------------- */
  // Paginate so every member is enterable without a long scroll. Page count
  // follows the roster size (13 members @ 10/page → 2 pages, more if raised).
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const startIdx = safePage * pageSize;
  const pageRows = rows
    .map((row, i) => ({ row, i }))
    .slice(startIdx, startIdx + pageSize);

  const saveDisabled = busy !== null || !dirty || !allFilled;
  const completeDisabled = busy !== null || dirty || !allFilled;

  return (
    <div className="space-y-4">
      <section className="portal-card pats-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {hideHeading ? (
            <p className="m-0 text-[0.8125rem] text-slate-500">
              {rosterCompleted
                ? tm.roster.completedShort
                : dirty
                  ? tm.roster.unsavedChanges
                  : tm.roster.filledCount(filledCount, rows.length)}
            </p>
          ) : (
            <div>
              <h2 className="portal-h2 mb-0.5">{tm.roster.heading}</h2>
              {/* No copy for the resting state — the roster's own table and
                  the inline hint below it already say what to do. */}
              {rosterCompleted || dirty ? (
                <p className="text-sm text-slate-600">
                  {rosterCompleted
                    ? tm.roster.completedShort
                    : tm.roster.unsavedChanges}
                </p>
              ) : null}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2.5">
            {flightsFinalized ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                {tm.roster.lockedByAdmin}
              </span>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                  disabled={busy !== null || !allFilled}
                  onClick={() => {
                    setRequestedCount(limit + 1);
                    setRequestOpen(true);
                  }}
                  title={!allFilled ? tm.roster.completeTitleFill : undefined}
                >
                  <UserPlus className="h-4 w-4" aria-hidden />
                  {tm.roster.requestAdditional}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saveDisabled || rosterCompleted}
                  onClick={saveRoster}
                  title={
                    !allFilled
                      ? tm.roster.saveTitleFill
                      : dirty
                        ? tm.roster.saveTitleDirty
                        : tm.roster.saveTitleNoChanges
                  }
                >
                  {busy === "save" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden />
                  )}
                  {tm.roster.saveRoster}
                </Button>
                {rosterCompleted ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => setComplete(false)}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    {tm.roster.edit}
                  </Button>
                ) : (
                  <button
                    type="button"
                    className="pp-btn pp-btn--primary"
                    disabled={completeDisabled}
                    onClick={markComplete}
                    title={
                      !allFilled
                        ? tm.roster.completeTitleFill
                        : dirty
                          ? tm.roster.completeTitleDirty
                          : tm.roster.completeTitleReady
                    }
                  >
                    {busy === "complete" ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    )}
                    {tm.roster.markComplete}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <caption className="sr-only">{tm.table.caption}</caption>
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="w-12 px-3 py-2.5 text-center">
                  #
                </th>
                <th scope="col" className="px-3 py-2.5">
                  <span
                    className="inline-flex items-center gap-1"
                    title={tm.table.serialTitle}
                  >
                    {tm.table.serialNumber}
                    <Info className="h-3 w-3 text-slate-400" aria-hidden />
                  </span>
                </th>
                <th scope="col" className="px-3 py-2.5">
                  <span
                    className="inline-flex items-center gap-1"
                    title={tm.table.rankTitle}
                  >
                    {tm.table.rank}
                    <Info className="h-3 w-3 text-slate-400" aria-hidden />
                  </span>
                </th>
                <th scope="col" className="px-3 py-2.5">
                  <span
                    className="inline-flex items-center gap-1"
                    title={tm.table.fullNameTitle}
                  >
                    {tm.table.fullName}
                    <Info className="h-3 w-3 text-slate-400" aria-hidden />
                  </span>
                </th>
                <th scope="col" className="w-32 px-3 py-2.5">
                  {tm.table.gender}
                </th>
                {canEdit ? (
                  <th scope="col" className="w-14 px-2 py-2.5">
                    <span className="sr-only">{tm.table.actions}</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pageRows.map(({ row, i }) => {
                const num = (
                  <td className="px-3 py-2 text-center font-medium text-slate-400">
                    {i + 1}
                  </td>
                );
                if (!canEdit) {
                  return (
                    <tr key={row.id ?? `row-${i}`}>
                      {num}
                      <td className="px-3 py-2.5 font-medium text-slate-800">
                        {row.serviceNumber || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">
                        {row.rank || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800">
                        {row.fullName || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">
                        {isRowBlank(row) ? "—" : genderLabels[row.gender] ?? row.gender}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr
                    key={row.id ?? `row-${i}`}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    {num}
                    <td className="px-2 py-1.5">
                      <Input
                        value={row.serviceNumber}
                        onChange={(e) =>
                          updateRow(i, { serviceNumber: e.target.value })
                        }
                        placeholder={tm.placeholders.serialEg}
                        disabled={busy !== null}
                        className="h-9"
                        aria-label={tm.aria.serialRow(i + 1)}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        value={row.rank}
                        onChange={(e) => updateRow(i, { rank: e.target.value })}
                        placeholder={tm.placeholders.rankEg}
                        disabled={busy !== null}
                        className="h-9"
                        aria-label={tm.aria.rankRow(i + 1)}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        value={row.fullName}
                        onChange={(e) =>
                          updateRow(i, { fullName: e.target.value })
                        }
                        placeholder={tm.placeholders.fullName}
                        disabled={busy !== null}
                        className="h-9"
                        aria-label={tm.aria.fullNameRow(i + 1)}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={row.gender}
                        onChange={(e) =>
                          updateRow(i, { gender: e.target.value })
                        }
                        disabled={busy !== null}
                        aria-label={tm.aria.genderRow(i + 1)}
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {genderLabels[g] ?? g}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={busy !== null || isRowBlank(row)}
                        onClick={() => clearRow(i)}
                        aria-label={tm.aria.clearRow(i + 1)}
                        title={tm.aria.clearRowTitle}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white !text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              aria-label={tm.aria.prevPage}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            {Array.from({ length: pageCount }).map((_, p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-label={tm.aria.page(p + 1)}
                aria-current={p === safePage ? "page" : undefined}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-bold transition-colors ${
                  p === safePage
                    ? "bg-emerald-700 !text-white"
                    : "border border-slate-200 bg-white !text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p + 1}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white !text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={safePage === pageCount - 1}
              onClick={() => setPage(safePage + 1)}
              aria-label={tm.aria.nextPage}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <span className="h-5 w-px bg-slate-200" aria-hidden />
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value) || 10);
              setPage(0);
            }}
            aria-label={tm.aria.rowsPerPage}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-600 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {tm.aria.perPage(n)}
              </option>
            ))}
          </select>
        </div>

        {/* Hint and the forward action share one row, so the way out of this
            step sits directly opposite the text explaining how to unlock it.
            `ms-auto` keeps the button trailing even when the hint is hidden
            (roster already complete) and mirrors correctly under RTL. */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {canEdit ? (
            <p className="m-0 flex min-w-[16rem] flex-1 items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-[0.8125rem] leading-relaxed text-emerald-900">
              <Info
                className="mt-px h-4 w-4 flex-shrink-0 text-emerald-700"
                aria-hidden
              />
              {tm.roster.infoNote}
            </p>
          ) : null}
          <button
            type="button"
            className="pp-btn pp-btn--primary ms-auto px-6 py-3 text-[0.9375rem]"
            disabled={busy !== null || !allFilled || dirty}
            onClick={goToFlights}
            title={
              !allFilled
                ? tm.roster.completeTitleFill
                : dirty
                  ? tm.roster.completeTitleDirty
                  : tm.roster.completeTitleReady
            }
          >
            {busy === "complete" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {t.common.next}: {t.journey.headers.flights.title}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {sizeRequest ? (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              sizeRequest.status === "APPROVED"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : sizeRequest.status === "REJECTED"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <p className="font-semibold">
              {tm.sizeRequest.summary(
                sizeRequest.requestedCount,
                sizeRequest.status === "PENDING"
                  ? tm.sizeRequest.pendingReview
                  : sizeRequest.status === "APPROVED"
                    ? tm.sizeRequest.approved
                    : sizeRequest.status === "REJECTED"
                      ? tm.sizeRequest.rejected
                      : sizeRequest.status.toLowerCase()
              )}
            </p>
            {sizeRequest.reviewNote ? (
              <p className="mt-1">{sizeRequest.reviewNote}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-800 to-green-900 px-6 py-5">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 140% at 100% 0%, rgba(216,185,104,0.28), transparent 55%)",
              }}
              aria-hidden
            />
            <DialogHeader className="relative space-y-0 text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                  <UserPlus className="h-5 w-5 text-white" aria-hidden />
                </span>
                <div>
                  <DialogTitle className="text-base font-bold text-white">
                    {tm.dialog.title}
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-xs text-emerald-50/90">
                    {tm.dialog.desc(limit)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div>
              <label
                htmlFor="requested-count"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                {tm.dialog.requestedSize}
              </label>
              <Input
                id="requested-count"
                type="number"
                min={limit + 1}
                max={200}
                step={1}
                inputMode="none"
                value={requestedCount}
                onKeyDown={(e) => {
                  // Spinner-only: block manual keyboard entry so the value can
                  // never be typed below the minimum (allow focus/dialog keys).
                  if (!["Tab", "Enter", "Escape"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) =>
                  setRequestedCount(
                    Math.max(
                      limit + 1,
                      Math.floor(Number(e.target.value) || limit + 1)
                    )
                  )
                }
              />
              <p className="mt-1 text-xs text-slate-500">
                {tm.dialog.between(limit + 1)}
              </p>
            </div>
            <div>
              <label
                htmlFor="justification"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                {tm.dialog.justification}
              </label>
              <Textarea
                id="justification"
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={tm.dialog.justificationPlaceholder}
              />
              <p
                className={`mt-1 text-xs ${
                  justification.trim().length < 20
                    ? "text-slate-400"
                    : "text-emerald-700"
                }`}
              >
                {tm.dialog.charsMin(justification.trim().length)}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 px-6 py-4">
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => setRequestOpen(false)}
            >
              {tm.dialog.cancel}
            </Button>
            <Button
              className="bg-emerald-700 text-white hover:bg-emerald-800"
              disabled={busy !== null || justification.trim().length < 20}
              onClick={submitSizeRequest}
            >
              {busy === "request" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {tm.dialog.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
