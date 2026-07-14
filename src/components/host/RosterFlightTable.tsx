import { cn, formatDateShort } from "@/lib/utils";

/**
 * A flight record as the HOST is allowed to see it: metadata plus a
 * server-computed presence flag per document. The stored file paths are
 * resolved on the server and NEVER travel into this component — the host area
 * is strictly read-only and exposes no download route.
 */
export type RosterFlightRecord = {
  id: string;
  passengerName: string;
  passportNumber: string;
  passportPresent: boolean;
  passportUploadedAt: Date | null;
  ticketPresent: boolean;
  ticketUploadedAt: Date | null;
};

/** One roster member joined to their flight record (null when nothing filed). */
export type RosterFlightRow = {
  id: string;
  fullName: string;
  serviceNumber: string;
  rank: string;
  flight: RosterFlightRecord | null;
};

/**
 * Read-only document status. PRESENT / ABSENT only — absent is amber so a gap
 * is the loudest thing in the row.
 */
export function DocPill({
  present,
  uploadedAt,
}: {
  present: boolean;
  uploadedAt?: Date | null;
}) {
  if (!present) {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-amber-700">
        Absent
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-green-700">
        Present
      </span>
      {uploadedAt ? (
        <span className="text-[10.5px] tabular-nums text-slate-400">
          {formatDateShort(uploadedAt)}
        </span>
      ) : null}
    </span>
  );
}

const HEADERS = [
  "#",
  "Full name",
  "Service no.",
  "Rank",
  "Passenger name",
  "Passport no.",
  "Passport",
  "Ticket",
];

/**
 * Per-member roster + flight table for the host drill-down. Deliberately NOT an
 * extension of the shared admin TeamRosterTable (that one is reused by the
 * admin UnitsTable / TeamRosterDialog and must keep its own column set).
 */
export function RosterFlightTable({
  rows,
  className,
}: {
  rows: RosterFlightRow[];
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="m-0 rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-[12.5px] font-medium text-slate-500">
        No team members added yet.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-[10px] border border-brand-line/70",
        className
      )}
    >
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50">
            {HEADERS.map((h) => (
              <th
                key={h}
                scope="col"
                className="whitespace-nowrap border-b border-brand-line/70 px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className="border-b border-brand-line/50 last:border-b-0 odd:bg-white even:bg-slate-50/60"
            >
              <td className="px-3 py-2.5 text-[12px] tabular-nums text-slate-400">
                {i + 1}
              </td>
              <td className="px-3 py-2.5 text-[13px] font-semibold text-slate-900">
                {row.fullName || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-[12.5px] tabular-nums text-slate-600">
                {row.serviceNumber || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-[12.5px] text-slate-600">
                {row.rank || "—"}
              </td>

              {row.flight ? (
                <>
                  <td className="px-3 py-2.5 text-[12.5px] text-slate-700">
                    {row.flight.passengerName || "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[12.5px] tabular-nums text-slate-600">
                    {row.flight.passportNumber || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <DocPill
                      present={row.flight.passportPresent}
                      uploadedAt={row.flight.passportUploadedAt}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <DocPill
                      present={row.flight.ticketPresent}
                      uploadedAt={row.flight.ticketUploadedAt}
                    />
                  </td>
                </>
              ) : (
                <td
                  colSpan={4}
                  className="border-l border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-[12.5px] font-bold text-amber-700"
                >
                  No flight record submitted
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
