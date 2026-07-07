"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TOAST } from "@/lib/toast";

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

/**
 * Admin review queue for team-size requests. Only administrators can decide;
 * SD / MT see a read-only queue.
 */
export function TeamSizeRequestsBoard({
  requests,
  canDecide,
}: {
  requests: BoardRequest[];
  canDecide: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const decide = async (id: string, status: "APPROVED" | "REJECTED") => {
    const reviewNote = (notes[id] ?? "").trim();
    if (status === "REJECTED" && !reviewNote) {
      toast.error("Provide a note explaining the rejection");
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/team-size-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote: reviewNote || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      toast.success(
        status === "APPROVED"
          ? "Request approved — participant limit raised"
          : "Request rejected"
      );
      router.refresh();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusyId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-body py-10 text-center text-sm text-slate-500">
          No team size requests yet.
        </div>
      </section>
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

      {requests.map((r) => (
        <section key={r.id} className="admin-user-detail-card">
          <div className="admin-user-detail-card-header">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="admin-user-detail-card-title">
                  {r.user.name}
                  {r.user.unitName ? ` · ${r.user.unitName}` : ""}
                </h3>
                <p className="admin-user-detail-card-desc">
                  {r.user.email} · submitted {fmt(r.createdAt)}
                </p>
              </div>
              <StatusPill status={r.status} />
            </div>
          </div>
          <div className="admin-user-detail-card-body space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span>
                <strong className="font-semibold">Current roster:</strong>{" "}
                {r.user.currentMembers} members
              </span>
              <span>
                <strong className="font-semibold">Current limit:</strong>{" "}
                {r.user.currentLimit}
              </span>
              <span className="text-emerald-700">
                <strong className="font-semibold">Requested:</strong>{" "}
                {r.requestedCount} members
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Justification
              </p>
              <p className="whitespace-pre-wrap">{r.justification}</p>
            </div>

            {r.status === "PENDING" && canDecide ? (
              <div className="space-y-2">
                <Textarea
                  rows={2}
                  className="admin-input"
                  placeholder="Review note (required when rejecting)…"
                  value={notes[r.id] ?? ""}
                  onChange={(e) =>
                    setNotes((n) => ({ ...n, [r.id]: e.target.value }))
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="adminApprove"
                    disabled={busyId !== null}
                    onClick={() => decide(r.id, "APPROVED")}
                  >
                    {busyId === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    )}
                    Approve — raise limit to {r.requestedCount}
                  </Button>
                  <Button
                    size="sm"
                    variant="adminDestructive"
                    disabled={busyId !== null}
                    onClick={() => decide(r.id, "REJECTED")}
                  >
                    <XCircle className="h-4 w-4" aria-hidden />
                    Reject
                  </Button>
                </div>
              </div>
            ) : r.status !== "PENDING" ? (
              <p className="text-xs text-slate-500">
                {r.status === "APPROVED" ? "Approved" : "Rejected"} by{" "}
                {r.reviewedBy?.name ?? "staff"} ({r.reviewedBy?.role ?? "—"})
                on {fmt(r.reviewedAt)}
                {r.reviewNote ? ` — “${r.reviewNote}”` : ""}
              </p>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
