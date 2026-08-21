"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  Loader2,
  SquarePen,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { TOAST } from "@/lib/toast";
import { cn } from "@/lib/utils";

type BoardRequest = {
  id: string;
  requestedCount: number;
  justification: string;
  status: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  reviewedBy: { name: string; role: string } | null;
  user: {
    id: string;
    name: string;
    email: string;
    unitName: string | null;
    currentMembers: number;
    currentLimit: number;
  };
};

type Decision = "APPROVED" | "REJECTED";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShort(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "APPROVED"
      ? "ops-status-approved"
      : status === "REJECTED"
        ? "ops-status-rejected"
        : "ops-status-pending";
  const label =
    status === "PENDING"
      ? "Pending"
      : status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`ops-status-pill ${cls}`}>{label}</span>;
}

/** Read-only view of one request — the justification no longer fits a column. */
function RequestDetailsDialog({
  request,
  onOpenChange,
}: {
  request: BoardRequest | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!request) return null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        dir="ltr"
        className="max-w-lg border-brand-line bg-white text-brand-ink shadow-[0_8px_30px_rgba(28,33,25,0.14)]"
      >
        <DialogTitle className="text-[1rem] font-bold tracking-[-0.01em] text-slate-900">
          {request.user.name}
          {request.user.unitName ? ` · ${request.user.unitName}` : ""}
        </DialogTitle>
        <DialogDescription className="mt-0.5 text-[0.8125rem] text-slate-500">
          {request.user.email} · submitted {fmt(request.createdAt)}
        </DialogDescription>

        <dl className="mt-1 grid grid-cols-3 gap-2 text-[0.8125rem]">
          <div className="rounded-[10px] border border-slate-200 bg-slate-50/70 px-3 py-2">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
              Roster
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {request.user.currentMembers}
            </dd>
          </div>
          <div className="rounded-[10px] border border-slate-200 bg-slate-50/70 px-3 py-2">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
              Current limit
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {request.user.currentLimit}
            </dd>
          </div>
          <div className="rounded-[10px] border border-emerald-200 bg-emerald-50/60 px-3 py-2">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-700">
              Requested
            </dt>
            <dd className="mt-0.5 font-semibold text-emerald-800">
              {request.requestedCount}
            </dd>
          </div>
        </dl>

        <div className="rounded-[10px] border border-slate-200 bg-slate-50/70 px-4 py-3 text-[0.8125rem] text-slate-700">
          <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
            Justification
          </p>
          <p className="whitespace-pre-wrap">{request.justification}</p>
        </div>

        {request.status !== "PENDING" ? (
          <p className="text-[0.75rem] text-slate-500">
            {request.status === "APPROVED" ? "Approved" : "Rejected"} by{" "}
            {request.reviewedBy?.name ?? "staff"} (
            {request.reviewedBy?.role ?? "—"}) on {fmt(request.reviewedAt)}
            {request.reviewNote ? ` — “${request.reviewNote}”` : ""}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Two-step decision flow: pick approve or
 * reject, then confirm. Rejection is the only branch that collects a note, and
 * it is collected on its own step so the reason box never sits in the table.
 */
function DecisionDialogs({
  request,
  onDone,
  onClose,
}: {
  request: BoardRequest | null;
  onDone: () => void;
  onClose: () => void;
}) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDecision(null);
    setNote("");
    setLoading(false);
  }, [request?.id]);

  if (!request) return null;

  const noteMissing = decision === "REJECTED" && !note.trim();

  const submit = async () => {
    if (!decision || noteMissing) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/team-size-requests/${request.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: decision,
            reviewNote: note.trim() || null,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      toast.success(
        decision === "APPROVED"
          ? "Request approved — participant limit raised"
          : "Request rejected"
      );
      onDone();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Step 1 — choose a decision */}
      <Dialog
        open={!decision}
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
      >
        <DialogContent
          dir="ltr"
          className="max-w-md border-brand-line bg-white text-brand-ink shadow-[0_8px_30px_rgba(28,33,25,0.14)]"
        >
          <DialogTitle className="text-[1rem] font-bold tracking-[-0.01em] text-slate-900">
            Team size request
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-[0.8125rem] text-slate-500">
            {request.user.name} asked to raise the cap from{" "}
            {request.user.currentLimit} to {request.requestedCount} members.
          </DialogDescription>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setDecision("APPROVED")}
              className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/50 px-3 py-2.5 text-left text-[0.8125rem] font-bold text-green-700 transition-colors hover:border-green-400 hover:bg-green-50"
            >
              <CheckCircle2 size={15} aria-hidden />
              <span className="min-w-0">
                Approve
                <span className="mt-0.5 block text-[0.6875rem] font-medium text-slate-500">
                  Raise limit to {request.requestedCount}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDecision("REJECTED")}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3 py-2.5 text-left text-[0.8125rem] font-bold text-red-700 transition-colors hover:border-red-400 hover:bg-red-50"
            >
              <XCircle size={15} aria-hidden />
              <span className="min-w-0">
                Reject
                <span className="mt-0.5 block text-[0.6875rem] font-medium text-slate-500">
                  Keep the current limit
                </span>
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 2 — confirm, and collect the reason when rejecting */}
      <Dialog
        open={Boolean(decision)}
        onOpenChange={(o) => {
          if (!o && !loading) setDecision(null);
        }}
      >
        <DialogContent
          dir="ltr"
          className="max-w-md border-brand-line bg-white text-brand-ink shadow-[0_8px_30px_rgba(28,33,25,0.14)]"
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "inline-flex h-10 w-10 flex-none items-center justify-center rounded-full",
                decision === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
              aria-hidden
            >
              {decision === "APPROVED" ? (
                <CheckCircle2 size={20} />
              ) : (
                <XCircle size={20} />
              )}
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-[1rem] font-bold tracking-[-0.01em] text-slate-900">
                {decision === "APPROVED" ? "Approve request" : "Reject request"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-[0.8125rem] leading-[1.5] text-slate-500">
                {decision === "APPROVED"
                  ? `${request.user.name}'s member cap will be raised to ${request.requestedCount}.`
                  : `${request.user.name} keeps the current limit of ${request.user.currentLimit}. Your reason is shown to them.`}
              </DialogDescription>
            </div>
          </div>

          {decision === "REJECTED" ? (
            <div className="mt-1">
              <label
                htmlFor={`team-request-reason-${request.id}`}
                className="mb-1.5 block text-[0.8125rem] font-semibold text-slate-700"
              >
                Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                id={`team-request-reason-${request.id}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                autoFocus
                className="min-h-[6rem] resize-y rounded-[10px] border-slate-200 text-[0.875rem] text-slate-900"
              />
            </div>
          ) : null}

          <div className="mt-1 flex justify-end gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => setDecision(null)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[0.8125rem] font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || noteMissing}
              onClick={() => void submit()}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-[0.8125rem] font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed",
                decision === "APPROVED"
                  ? "bg-green-700 hover:bg-green-800 disabled:bg-green-300"
                  : "bg-red-700 hover:bg-red-800 disabled:bg-red-300"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {decision === "APPROVED" ? "Approve" : "Reject request"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Admin review queue for team-size requests. Only administrators can decide;
 * SD / MT see the same table without the decision action.
 */
export function TeamSizeRequestsBoard({
  requests,
  canDecide,
}: {
  requests: BoardRequest[];
  canDecide: boolean;
}) {
  const router = useRouter();
  const [viewing, setViewing] = useState<BoardRequest | null>(null);
  const [deciding, setDeciding] = useState<BoardRequest | null>(null);

  if (requests.length === 0) {
    return (
      <AdminEmptyState
        icon={CheckCircle2}
        title="No team size requests"
        description="You're all caught up. New requests to exceed the team-member cap will appear here for review."
      />
    );
  }

  return (
    <div className="space-y-4">
      {!canDecide ? (
        <div className="portal-alert-info flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
          <Eye className="h-4 w-4 shrink-0" aria-hidden />
          View-only access — team size requests are decided by the
          Administrator.
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="admin-data-table min-w-[52rem]">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[16%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="!text-left">Participant</th>
              <th scope="col" className="!text-left">Unit</th>
              <th scope="col">Roster</th>
              <th scope="col">Limit</th>
              <th scope="col">Requested</th>
              <th scope="col">Submitted</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="admin-users-cell-participant">
                  <div className="admin-users-participant">
                    <span className="admin-users-avatar" aria-hidden>
                      {initials(r.user.name)}
                    </span>
                    <div className="admin-users-participant-text">
                      <div className="admin-users-participant-name">
                        {r.user.name}
                      </div>
                      <div className="admin-users-participant-sub">
                        {r.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="!text-left text-sm text-slate-600">
                  <div className="admin-users-unit-name">
                    {r.user.unitName ?? "—"}
                  </div>
                </td>
                <td className="text-[0.8125rem] text-slate-600">
                  {r.user.currentMembers}
                </td>
                <td className="text-[0.8125rem] text-slate-600">
                  {r.user.currentLimit}
                </td>
                <td className="text-[0.8125rem] font-semibold text-emerald-700">
                  {r.requestedCount}
                </td>
                <td className="whitespace-nowrap text-[0.8125rem] text-slate-600">
                  {fmtShort(r.createdAt)}
                </td>
                <td className="!overflow-visible px-1.5">
                  <div className="flex w-full min-w-0 items-center justify-center">
                    <StatusPill status={r.status} />
                  </div>
                </td>
                <td>
                  <div className="admin-table-actions admin-table-actions--center">
                    <Button
                      size="sm"
                      variant="adminOutline"
                      className="portal-table-action-btn portal-table-action-btn--icon"
                      aria-label="View request details"
                      title="View request details"
                      onClick={() => setViewing(r)}
                    >
                      <Eye className="h-4 w-4" aria-hidden />
                    </Button>
                    {canDecide && r.status === "PENDING" ? (
                      <Button
                        size="sm"
                        variant="adminOutline"
                        className="portal-table-action-btn portal-table-action-btn--icon portal-table-action-btn--info"
                        aria-label="Decide request"
                        title="Decide request"
                        onClick={() => setDeciding(r)}
                      >
                        <SquarePen className="h-4 w-4" aria-hidden />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RequestDetailsDialog
        request={viewing}
        onOpenChange={(o) => {
          if (!o) setViewing(null);
        }}
      />

      <DecisionDialogs
        request={deciding}
        onClose={() => setDeciding(null)}
        onDone={() => {
          setDeciding(null);
          router.refresh();
        }}
      />
    </div>
  );
}
