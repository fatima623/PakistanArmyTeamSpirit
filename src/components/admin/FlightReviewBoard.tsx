"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Lock,
  Plane,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
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

type FlightRow = ReviewFlight & {
  participantId: string;
  participantName: string;
  unitName: string | null;
  finalizedAt: string | null;
};

const PAGE_SIZE = 8;

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
      <span className="admin-flights-doc admin-flights-doc--missing">
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
      className="admin-flights-doc"
      title={fileName}
    >
      <FileText className="h-3.5 w-3.5" aria-hidden />
      Open PDF
    </a>
  );
}

/**
 * Staff review board for flight submissions — a single paginated table of all
 * flight records. All staff can view documents; only the Administrator
 * finalizes / unlocks a participant's records.
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
  const [page, setPage] = useState(0);

  const rows = useMemo<FlightRow[]>(
    () =>
      participants.flatMap((p) =>
        p.flights.map((f) => ({
          ...f,
          participantId: p.id,
          participantName: p.name,
          unitName: p.unitName,
          finalizedAt: p.flightsFinalizedAt,
        }))
      ),
    [participants]
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages - 1);
  const pageRows = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

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

  if (rows.length === 0) {
    return (
      <AdminEmptyState
        icon={Plane}
        title="No flight records yet"
        description="Once participants submit passports and tickets for their travellers, the records will appear here for review."
      />
    );
  }

  return (
    <div className="admin-flights">
      <div className="admin-flights-wrap">
        <table className="admin-data-table admin-flights-table w-full">
          <thead className="admin-table-head">
            <tr>
              <th scope="col">Traveller</th>
              <th scope="col">Passenger Name</th>
              <th scope="col">Passport No.</th>
              <th scope="col">Passport</th>
              <th scope="col">Ticket</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="admin-row-hover">
                <td className="admin-flights-strong">{r.traveler ?? "—"}</td>
                <td className="admin-flights-strong">{r.passengerName}</td>
                <td className="admin-flights-mono">{r.passportNumber}</td>
                <td>
                  <DocLink
                    flightId={r.id}
                    type="passport"
                    fileName={r.passportFileName}
                  />
                </td>
                <td>
                  <DocLink
                    flightId={r.id}
                    type="ticket"
                    fileName={r.ticketFileName}
                  />
                </td>
                <td>
                  <div className="admin-flights-status">
                    {r.finalizedAt ? (
                      <span className="ops-status-pill ops-status-approved">
                        Finalized
                      </span>
                    ) : (
                      <span className="ops-status-pill ops-status-pending">
                        Awaiting
                      </span>
                    )}
                    {canFinalize ? (
                      r.finalizedAt ? (
                        <button
                          type="button"
                          className="admin-flights-fin admin-flights-fin--unlock"
                          title="Unlock records"
                          aria-label={`Unlock ${r.participantName}'s flight records`}
                          disabled={busyId !== null}
                          onClick={() => setFinalized(r.participantId, false)}
                        >
                          {busyId === r.participantId ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <Unlock className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <ConfirmDialog
                          trigger={
                            <button
                              type="button"
                              className="admin-flights-fin admin-flights-fin--lock"
                              title="Finalize records"
                              aria-label={`Finalize ${r.participantName}'s flight records`}
                              disabled={busyId !== null}
                            >
                              {busyId === r.participantId ? (
                                <Loader2
                                  className="h-4 w-4 animate-spin"
                                  aria-hidden
                                />
                              ) : (
                                <Lock className="h-4 w-4" aria-hidden />
                              )}
                            </button>
                          }
                          title="Finalize flight details"
                          description={`Lock ${r.participantName}'s flight records? The participant can no longer edit them, and the Host Information section becomes visible to them once published.`}
                          confirmLabel="Finalize"
                          onConfirm={() => setFinalized(r.participantId, true)}
                        />
                      )
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-flights-foot">
        <span className="admin-flights-count">
          {rows.length} flight record{rows.length === 1 ? "" : "s"}
        </span>
        {totalPages > 1 ? (
          <div className="admin-flights-pager">
            <button
              type="button"
              className="admin-flights-pager-btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <span className="admin-flights-pager-label">
              Page {current + 1} of {totalPages}
            </span>
            <button
              type="button"
              className="admin-flights-pager-btn"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={current >= totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
