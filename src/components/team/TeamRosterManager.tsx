"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TOAST } from "@/lib/toast";
import type { TeamMemberRecord } from "@/lib/team-members";

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

const rowError = (r: Row): string | null => {
  if (isRowBlank(r)) return null;
  if (!r.serviceNumber.trim()) return "Serial number is required";
  if (!r.rank.trim()) return "Rank is required";
  if (!r.fullName.trim()) return "Full name is required";
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

function fmt(dateIso: string | null): string | null {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-GB", {
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
}) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberRecord[]>(initialMembers);
  const [rows, setRows] = useState<Row[]>(() =>
    buildRows(initialMembers, limit)
  );
  const [rosterCompleted, setRosterCompleted] = useState(
    initialRosterCompleted
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestedCount, setRequestedCount] = useState(limit + 1);
  const [justification, setJustification] = useState("");
  const [sizeRequest, setSizeRequest] = useState<SizeRequest | null>(
    latestRequest
  );

  const canEdit = teamRegistered && !flightsFinalized;
  const filledCount = rows.filter((r) => !isRowBlank(r)).length;
  const dirty = useMemo(
    () => JSON.stringify(buildRows(members, limit)) !== JSON.stringify(rows),
    [members, rows, limit]
  );

  const windowLabel = useMemo(() => {
    const open = fmt(windowOpenIso);
    const close = fmt(windowCloseIso);
    if (windowState === "before") {
      return open
        ? `Team registration opens on ${open}.`
        : "Team registration has not opened yet.";
    }
    if (windowState === "closed") {
      return close
        ? `Team registration closed on ${close}.`
        : "The team registration period has closed.";
    }
    if (close) return `Team registration is open until ${close}.`;
    return "Team registration is open.";
  }, [windowState, windowOpenIso, windowCloseIso]);

  const apiError = async (res: Response) => {
    const data = await res.json().catch(() => ({}));
    if (data.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (typeof first === "string") return first;
    }
    return typeof data.error === "string" ? data.error : TOAST.GENERIC_ERROR;
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
      toast.success("Team registered — you can now build your roster");
      router.refresh();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusy(null);
    }
  };

  /**
   * Persist the grid. Deletes cleared members first (frees the cap), then
   * walks the rows in order applying updates / creates so the saved order
   * matches what the participant sees.
   */
  const saveRoster = async (): Promise<boolean> => {
    for (let i = 0; i < rows.length; i++) {
      const err = rowError(rows[i]);
      if (err) {
        toast.error(`Row ${i + 1}: ${err}`);
        return false;
      }
    }

    const seen = new Set<string>();
    for (const r of rows) {
      if (isRowBlank(r)) continue;
      const key = r.serviceNumber.trim().toLowerCase();
      if (seen.has(key)) {
        toast.error(`Duplicate serial number: ${r.serviceNumber.trim()}`);
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
      toast.success("Roster saved");
      router.refresh();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : TOAST.GENERIC_ERROR);
      await reload();
      return false;
    } finally {
      setBusy(null);
    }
  };

  const setComplete = async (complete: boolean) => {
    setBusy("complete");
    try {
      const res = await fetch("/api/user/team-roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complete }),
      });
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      setRosterCompleted(complete);
      toast.success(
        complete
          ? "Roster completed — Flight Details is now available"
          : "Roster reopened for editing"
      );
      router.refresh();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusy(null);
    }
  };

  /** Save any pending edits before locking the roster in. */
  const markComplete = async () => {
    if (dirty) {
      const ok = await saveRoster();
      if (!ok) return;
    }
    await setComplete(true);
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
      toast.success("Request submitted to the administrators for approval");
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusy(null);
    }
  };

  /* ---------------- not yet registered ---------------- */
  if (!teamRegistered) {
    return (
      <section className="portal-card pats-panel">
        <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
            <Users className="h-7 w-7 text-emerald-700" aria-hidden />
          </span>
          <div>
            <h2 className="portal-h2 mb-1">Team Registration</h2>
            <p className="mx-auto max-w-md text-sm text-slate-600">
              Register your team to unlock the team member roster. {windowLabel}
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
              ? "Registration window open"
              : windowState === "before"
                ? "Window not yet open"
                : "Window closed"}
          </div>
          <Button
            size="lg"
            className="bg-emerald-700 text-white hover:bg-emerald-800 disabled:!opacity-100 disabled:!bg-slate-200 disabled:!text-slate-500 disabled:!shadow-none"
            disabled={!canRegister || busy !== null}
            onClick={registerTeam}
            title={
              canRegister
                ? "Register your team now"
                : windowState !== "open"
                  ? "Available only during the active registration period"
                  : "Complete the previous workflow stages first"
            }
          >
            {busy === "register" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ClipboardCheck className="h-4 w-4" aria-hidden />
            )}
            Register Team
          </Button>
          {!canRegister && windowState === "open" ? (
            <p className="text-xs text-slate-500">
              Team registration unlocks after participation confirmation, SD
              registration verification, and MT payment verification.
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  /* ---------------- roster grid ---------------- */
  const progress = Math.min(
    100,
    Math.round((filledCount / Math.max(limit, 1)) * 100)
  );

  // Paginate so every member is enterable without a long scroll.
  const pageSize = 7;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const startIdx = safePage * pageSize;
  const pageRows = rows
    .map((row, i) => ({ row, i }))
    .slice(startIdx, startIdx + pageSize);

  return (
    <div className="space-y-4">
      <section className="portal-card pats-panel">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="portal-h2 mb-0.5">Team Members</h2>
            <p className="text-sm text-slate-600">
              {rosterCompleted
                ? "Roster completed"
                : dirty
                  ? "You have unsaved changes"
                  : "Enter each team member's details below."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {flightsFinalized ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Locked by administration
              </span>
            ) : (
              <>
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        disabled={busy !== null}
                        onClick={() => {
                          setRequestedCount(limit + 1);
                          setRequestOpen(true);
                        }}
                        aria-label="Request additional team members"
                      >
                        <UserPlus className="h-4 w-4" aria-hidden />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Request additional team members
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy !== null || !dirty}
                  onClick={saveRoster}
                  title={
                    dirty ? "Save your roster" : "No changes to save"
                  }
                >
                  {busy === "save" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden />
                  )}
                  Save
                </Button>
                {rosterCompleted ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => setComplete(false)}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-emerald-700 text-white hover:bg-emerald-800"
                    disabled={busy !== null || filledCount === 0}
                    onClick={markComplete}
                    title={
                      filledCount === 0
                        ? "Add at least one team member first"
                        : "Save and complete the roster to unlock Flight Details"
                    }
                  >
                    {busy === "complete" ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    )}
                    Mark roster complete
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* progress */}
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <caption className="sr-only">
              Team members — serial number, rank, full name and gender
            </caption>
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="w-12 px-3 py-2.5 text-center">
                  #
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Serial Number
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Rank
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Full Name
                </th>
                <th scope="col" className="w-32 px-3 py-2.5">
                  Gender
                </th>
                {canEdit ? (
                  <th scope="col" className="w-14 px-2 py-2.5">
                    <span className="sr-only">Actions</span>
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
                        {isRowBlank(row) ? "—" : row.gender}
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
                        placeholder="e.g. PA-12345"
                        disabled={busy !== null}
                        className="h-9"
                        aria-label={`Serial number, row ${i + 1}`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        value={row.rank}
                        onChange={(e) => updateRow(i, { rank: e.target.value })}
                        placeholder="e.g. Captain"
                        disabled={busy !== null}
                        className="h-9"
                        aria-label={`Rank, row ${i + 1}`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        value={row.fullName}
                        onChange={(e) =>
                          updateRow(i, { fullName: e.target.value })
                        }
                        placeholder="Full name"
                        disabled={busy !== null}
                        className="h-9"
                        aria-label={`Full name, row ${i + 1}`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={row.gender}
                        onChange={(e) =>
                          updateRow(i, { gender: e.target.value })
                        }
                        disabled={busy !== null}
                        aria-label={`Gender, row ${i + 1}`}
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                        disabled={busy !== null || isRowBlank(row)}
                        onClick={() => clearRow(i)}
                        aria-label={`Clear row ${i + 1}`}
                        title="Clear this row"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pageCount > 1 ? (
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              {Array.from({ length: pageCount }).map((_, p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p + 1}`}
                  aria-current={p === safePage ? "page" : undefined}
                  className={`h-8 min-w-8 rounded-md px-2 text-sm font-semibold transition-colors ${
                    p === safePage
                      ? "bg-emerald-700 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {p + 1}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={safePage === pageCount - 1}
                onClick={() => setPage(safePage + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}

        {canEdit ? (
          <p className="mt-3 text-xs text-slate-500">
           Fill in your team member details,then click on save button. After saving, mark the roster button complete to unlock flight details.
          </p>
        ) : null}

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
              Team size request — {sizeRequest.requestedCount} members:{" "}
              {sizeRequest.status === "PENDING"
                ? "pending admin review"
                : sizeRequest.status.toLowerCase()}
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
                    Request additional members
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-xs text-emerald-50/90">
                    Your team limit is {limit}. Ask the administration to raise
                    it — they&apos;ll review your request.
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
                Requested team size
              </label>
              <Input
                id="requested-count"
                type="number"
                min={limit + 1}
                max={200}
                value={requestedCount}
                onChange={(e) =>
                  setRequestedCount(Number(e.target.value) || limit + 1)
                }
              />
              <p className="mt-1 text-xs text-slate-500">
                Between {limit + 1} and 200 members.
              </p>
            </div>
            <div>
              <label
                htmlFor="justification"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Justification
              </label>
              <Textarea
                id="justification"
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain why your team needs additional members…"
              />
              <p
                className={`mt-1 text-xs ${
                  justification.trim().length < 20
                    ? "text-slate-400"
                    : "text-emerald-700"
                }`}
              >
                {justification.trim().length}/20 characters minimum
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 px-6 py-4">
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => setRequestOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-700 text-white hover:bg-emerald-800"
              disabled={busy !== null || justification.trim().length < 20}
              onClick={submitSizeRequest}
            >
              {busy === "request" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
