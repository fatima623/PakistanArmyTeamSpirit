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
  AlertTriangle,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { TOAST } from "@/lib/toast";

/** File paths never cross this boundary — only "is it on file" booleans. */
type ReviewFlight = {
  id: string;
  passengerName: string;
  passportNumber: string;
  passportFileName: string | null;
  ticketFileName: string | null;
  hasPassport: boolean;
  hasTicket: boolean;
  complete: boolean;
  updatedAt: string;
};

type ReviewTraveller = {
  id: string;
  fullName: string;
  rank: string;
  serviceNumber: string;
  flight: ReviewFlight | null;
};

type ReviewTeam = {
  id: string;
  name: string;
  email: string;
  country: string | null;
  unitName: string | null;
  rosterCompletedAt: string | null;
  flightsFinalizedAt: string | null;
  memberCount: number;
  flightsOnFile: number;
  docsComplete: number;
  travellers: ReviewTraveller[];
  legacyFlights: ReviewFlight[];
};

/** Teams are paginated, never travellers — a team must never lose its finalize control to a page break. */
const TEAMS_PER_PAGE = 4;

function DocLink({
  flightId,
  type,
  onFile,
  fileName,
}: {
  flightId: string;
  type: "passport" | "ticket";
  onFile: boolean;
  fileName: string | null;
}) {
  if (!onFile) {
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
      title={fileName ?? "Open document"}
    >
      <FileText className="h-3.5 w-3.5" aria-hidden />
      Open PDF
    </a>
  );
}

function CoveragePill({
  label,
  done,
  total,
}: {
  label: string;
  done: number;
  total: number;
}) {
  const complete = total > 0 && done === total;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        complete
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {label}
      <span className="font-mono tabular-nums">
        {done}/{total}
      </span>
    </span>
  );
}

function FlightCells({ flight }: { flight: ReviewFlight }) {
  return (
    <>
      <td className="admin-flights-strong">{flight.passengerName}</td>
      <td className="admin-flights-mono">{flight.passportNumber}</td>
      <td>
        <DocLink
          flightId={flight.id}
          type="passport"
          onFile={flight.hasPassport}
          fileName={flight.passportFileName}
        />
      </td>
      <td>
        <DocLink
          flightId={flight.id}
          type="ticket"
          onFile={flight.hasTicket}
          fileName={flight.ticketFileName}
        />
      </td>
      <td>
        <span
          className={`ops-status-pill ${
            flight.complete ? "ops-status-approved" : "ops-status-pending"
          }`}
        >
          {flight.complete ? "Complete" : "Incomplete"}
        </span>
      </td>
    </>
  );
}

/**
 * Staff review board for flight submissions — grouped BY TEAM, with one row per
 * roster traveller (including travellers who have submitted nothing) and one
 * Finalize / Unlock control per team. All staff can view documents; only the
 * Administrator finalizes / unlocks.
 */
export function FlightReviewBoard({
  teams,
  canFinalize,
}: {
  teams: ReviewTeam[];
  canFinalize: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(teams.length / TEAMS_PER_PAGE));
  const current = Math.min(page, totalPages - 1);
  const pageTeams = useMemo(
    () =>
      teams.slice(current * TEAMS_PER_PAGE, current * TEAMS_PER_PAGE + TEAMS_PER_PAGE),
    [teams, current]
  );

  const setFinalized = async (
    userId: string,
    finalized: boolean,
    force = false
  ) => {
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/flights/finalize", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, finalized, force }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // 409 = the completeness gate rejected it; the server names the gap.
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

  if (teams.length === 0) {
    return (
      <AdminEmptyState
        icon={Plane}
        title="No flight records yet"
        description="Once participants complete their roster and submit passports and tickets for their travellers, the records will appear here for review."
      />
    );
  }

  return (
    <div className="admin-flights flex flex-col gap-5">
      {pageTeams.map((team) => {
        const finalized = team.flightsFinalizedAt !== null;
        const ready = team.memberCount > 0 && team.docsComplete === team.memberCount;
        const missing = team.memberCount - team.docsComplete;
        const busy = busyId === team.id;

        return (
          <section
            key={team.id}
            className="admin-surface flex flex-col gap-3.5 rounded-2xl border border-brand-line/70 bg-white p-4 shadow-[0_1px_3px_rgba(20,30,24,0.05)]"
          >
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold tracking-[-0.01em] text-brand-ink">
                  {team.unitName ?? team.name}
                </h3>
                <p className="mt-0.5 truncate text-xs text-brand-ink-muted">
                  {team.name}
                  {team.country ? ` · ${team.country}` : ""} · {team.email}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <CoveragePill
                  label="Flights on file"
                  done={team.flightsOnFile}
                  total={team.memberCount}
                />
                <CoveragePill
                  label="Docs complete"
                  done={team.docsComplete}
                  total={team.memberCount}
                />
                <span
                  className={`ops-status-pill ${
                    finalized
                      ? "ops-status-approved"
                      : ready
                        ? "ops-status-review"
                        : "ops-status-pending"
                  }`}
                >
                  {finalized ? "Finalized" : ready ? "Ready" : "Incomplete"}
                </span>

                {canFinalize ? (
                  finalized ? (
                    <ConfirmDialog
                      trigger={
                        <Button
                          type="button"
                          variant="adminOutline"
                          size="sm"
                          disabled={busyId !== null}
                          aria-label={`Unlock ${team.name}'s flight records`}
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <Unlock className="h-4 w-4" aria-hidden />
                          )}
                          Unlock
                        </Button>
                      }
                      title="Unlock flight details"
                      description={`Reopen ${team.name}'s flight records for editing? The participant can change them again until you finalize once more.`}
                      confirmLabel="Unlock"
                      onConfirm={() => setFinalized(team.id, false)}
                    />
                  ) : (
                    <ConfirmDialog
                      trigger={
                        <Button
                          type="button"
                          variant={ready ? "adminPrimary" : "adminDestructive"}
                          size="sm"
                          disabled={busyId !== null}
                          aria-label={`Finalize ${team.name}'s flight records`}
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : ready ? (
                            <Lock className="h-4 w-4" aria-hidden />
                          ) : (
                            <AlertTriangle className="h-4 w-4" aria-hidden />
                          )}
                          {ready ? "Finalize" : "Finalize anyway"}
                        </Button>
                      }
                      title={
                        ready ? "Finalize flight details" : "Finalize incomplete team"
                      }
                      description={
                        ready
                          ? `Lock ${team.name}'s flight records? The participant can no longer edit them, and the Host Information section becomes visible to them once published.`
                          : team.memberCount === 0
                            ? `${team.name} has no travellers on its roster. Finalizing locks the team with no flight records at all — only do this deliberately.`
                            : `${missing} of ${team.memberCount} traveller${
                                team.memberCount === 1 ? "" : "s"
                              } still need a passport and ticket. Finalizing now locks the team with incomplete documents and overrides the completeness check.`
                      }
                      confirmLabel={ready ? "Finalize" : "Override and finalize"}
                      onConfirm={() => setFinalized(team.id, true, !ready)}
                    />
                  )
                ) : null}
              </div>
            </header>

            <div className="admin-flights-wrap">
              <table className="admin-data-table admin-flights-table w-full">
                <thead className="admin-table-head">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Traveller</th>
                    <th scope="col">Passenger Name</th>
                    <th scope="col">Passport No.</th>
                    <th scope="col">Passport</th>
                    <th scope="col">Ticket</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.travellers.map((t, i) => (
                    <tr key={t.id} className="admin-row-hover">
                      <td className="admin-flights-mono">{i + 1}</td>
                      <td className="admin-flights-strong">
                        {t.rank ? `${t.rank} ` : ""}
                        {t.fullName}
                        <span className="ml-2 admin-flights-mono">
                          {t.serviceNumber}
                        </span>
                      </td>
                      {t.flight ? (
                        <FlightCells flight={t.flight} />
                      ) : (
                        <td colSpan={5}>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                            No flight record — nothing submitted for this traveller
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}

                  {team.memberCount === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-table-empty">
                        No travellers on the roster yet.
                      </td>
                    </tr>
                  ) : null}

                  {team.legacyFlights.map((f, i) => (
                    <tr key={f.id} className="admin-row-hover">
                      <td className="admin-flights-mono">
                        {team.memberCount + i + 1}
                      </td>
                      <td>
                        <span className="ops-status-pill ops-status-neutral">
                          Unlinked (legacy)
                        </span>
                      </td>
                      <FlightCells flight={f} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {team.legacyFlights.length > 0 ? (
              <p className="text-xs text-brand-ink-muted">
                Legacy records were submitted before travellers were linked
                individually. They do not count towards this team&apos;s coverage
                — the participant must re-link them to a traveller.
              </p>
            ) : null}
          </section>
        );
      })}

      {totalPages > 1 ? (
        <div className="admin-flights-foot">
          <span className="admin-flights-pager-label">
            {teams.length} team{teams.length === 1 ? "" : "s"}
          </span>
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
        </div>
      ) : null}
    </div>
  );
}
