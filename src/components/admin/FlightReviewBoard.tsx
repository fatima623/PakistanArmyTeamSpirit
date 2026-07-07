"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TOAST } from "@/lib/toast";

type ReviewFlight = {
  id: string;
  passengerName: string;
  passportNumber: string;
  passportFileName: string | null;
  ticketFileName: string | null;
  updatedAt: string;
  traveler: string | null;
};

type ReviewParticipant = {
  id: string;
  name: string;
  email: string;
  country: string | null;
  unitName: string | null;
  memberCount: number;
  rosterCompletedAt: string | null;
  flightsFinalizedAt: string | null;
  flights: ReviewFlight[];
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

function DocLink({
  flightId,
  type,
  fileName,
}: {
  flightId: string;
  type: "passport" | "ticket";
  fileName: string | null;
}) {
  if (!fileName) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <FileText className="h-3.5 w-3.5" aria-hidden />
        Missing
      </span>
    );
  }
  return (
    <a
      href={`/api/admin/flights/${flightId}/file?type=${type}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
      title={fileName}
    >
      <FileText className="h-3.5 w-3.5" aria-hidden />
      Open PDF
    </a>
  );
}

/**
 * Staff review board for flight submissions. All staff can view documents;
 * only the Administrator finalizes / unlocks records.
 */
export function FlightReviewBoard({
  participants,
  canFinalize,
}: {
  participants: ReviewParticipant[];
  canFinalize: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const setFinalized = async (userId: string, finalized: boolean) => {
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/flights/finalize", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, finalized }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
        return;
      }
      toast.success(
        finalized
          ? "Flight details finalized — records locked for the participant"
          : "Flight details unlocked for editing"
      );
      router.refresh();
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setBusyId(null);
    }
  };

  if (participants.length === 0) {
    return (
      <section className="admin-user-detail-card">
        <div className="admin-user-detail-card-body py-10 text-center text-sm text-slate-500">
          No participants have reached the flight details stage yet.
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {!canFinalize ? (
        <div className="portal-alert-info flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
          <Eye className="h-4 w-4 shrink-0" aria-hidden />
          View-only access — finalization is performed by the Administrator.
        </div>
      ) : null}

      {participants.map((p) => (
        <section key={p.id} className="admin-user-detail-card">
          <div className="admin-user-detail-card-header">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="admin-user-detail-card-title">
                  {p.name}
                  {p.unitName ? ` · ${p.unitName}` : ""}
                </h3>
                <p className="admin-user-detail-card-desc">
                  {p.email}
                  {p.country ? ` · ${p.country}` : ""} · {p.memberCount} roster
                  members · {p.flights.length} flight record
                  {p.flights.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.flightsFinalizedAt ? (
                  <span className="ops-status-pill ops-status-approved">
                    Finalized {fmt(p.flightsFinalizedAt)}
                  </span>
                ) : (
                  <span className="ops-status-pill ops-status-pending">
                    Awaiting finalization
                  </span>
                )}
                {canFinalize ? (
                  p.flightsFinalizedAt ? (
                    <Button
                      size="sm"
                      variant="adminOutline"
                      disabled={busyId !== null}
                      onClick={() => setFinalized(p.id, false)}
                    >
                      {busyId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Unlock className="h-4 w-4" aria-hidden />
                      )}
                      Unlock
                    </Button>
                  ) : (
                    <ConfirmDialog
                      trigger={
                        <Button
                          size="sm"
                          variant="adminApprove"
                          disabled={busyId !== null}
                        >
                          {busyId === p.id ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Lock className="h-4 w-4" aria-hidden />
                          )}
                          Finalize
                        </Button>
                      }
                      title="Finalize flight details"
                      description={`Lock ${p.name}'s flight records? The participant can no longer edit them, and the Host Information section becomes visible to them once published.`}
                      confirmLabel="Finalize"
                      onConfirm={() => setFinalized(p.id, true)}
                    />
                  )
                ) : null}
              </div>
            </div>
          </div>
          <div className="admin-user-detail-card-body">
            {p.flights.length === 0 ? (
              <p className="py-2 text-sm text-slate-500">
                Roster completed — no flight records submitted yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th scope="col" className="px-3 py-2">
                        Traveler
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Passenger Name
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Passport No.
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Passport
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Ticket
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {p.flights.map((f) => (
                      <tr key={f.id}>
                        <td className="px-3 py-2 text-slate-800">
                          {f.traveler ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-slate-800">
                          {f.passengerName}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-700">
                          {f.passportNumber}
                        </td>
                        <td className="px-3 py-2">
                          <DocLink
                            flightId={f.id}
                            type="passport"
                            fileName={f.passportFileName}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <DocLink
                            flightId={f.id}
                            type="ticket"
                            fileName={f.ticketFileName}
                          />
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {fmt(f.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {canFinalize && !p.flightsFinalizedAt ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Verify every traveler has both PDFs before finalizing.
              </p>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
