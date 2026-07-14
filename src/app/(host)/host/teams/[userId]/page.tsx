import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Plane, Users2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireHostSession } from "@/lib/require-host";
import { flightDetailSummarySelect } from "@/lib/flights";
import { teamMemberSelect } from "@/lib/team-members";
import { formatDateShort } from "@/lib/utils";
import { displayCountry } from "@/lib/participant-country";
import {
  DocPill,
  RosterFlightTable,
  type RosterFlightRow,
} from "@/components/host/RosterFlightTable";

export const metadata: Metadata = {
  title: "Team Details",
};

/** One labelled read-only field tile. */
function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex min-w-0 flex-col gap-[5px] rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-3">
      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">
        {label}
      </span>
      <span className="break-words text-[0.875rem] font-semibold text-slate-900">
        {value?.trim() || "—"}
      </span>
    </div>
  );
}

function CardHeader({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <header className="flex items-center gap-2 border-b border-gray-200 bg-slate-50 px-[18px] py-3 text-[0.875rem] font-bold tracking-[-0.01em] text-slate-900 [&_svg]:flex-shrink-0 [&_svg]:text-green-700">
      {icon}
      {children}
    </header>
  );
}

export default async function HostTeamDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await requireHostSession();

  const formation = await prisma.hostFormation.findUnique({
    where: { hostUserId: session.user.id },
    select: { id: true, name: true },
  });

  if (!formation) notFound();

  /**
   * IDOR guard: requireHostSession only proves the caller is *a* host. The team
   * must be scoped to THIS host's formation — findUnique({ id }) would let any
   * host read any team by guessing an id.
   */
  const team = await prisma.user.findFirst({
    where: { id: userId, hostFormationId: formation.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rank: true,
      country: true,
      nationality: true,
      finalizedForHostAt: true,
      unit: {
        select: {
          unitName: true,
          unitType: true,
          branch: true,
          arm: true,
          service: true,
          patrolsRequested: true,
          coName: true,
          coRank: true,
          coEmail: true,
          coPhone: true,
          telephoneMil: true,
          telephoneCiv: true,
          unitAddress: true,
          postcode: true,
        },
      },
      teamMembers: {
        orderBy: { createdAt: "asc" },
        select: {
          ...teamMemberSelect,
          flightDetail: { select: flightDetailSummarySelect },
        },
      },
      // Legacy team-level rows never linked to a roster member — shown, never dropped.
      flightDetails: {
        where: { teamMemberId: null },
        orderBy: { createdAt: "asc" },
        select: flightDetailSummarySelect,
      },
    },
  });

  if (!team) notFound();

  /**
   * Document presence is resolved from the STORED FILE (passportFilePath /
   * ticketFilePath — the same truth as isFlightRecordComplete), never from the
   * display-only *FileName. The paths stay in the `where` clause: they are never
   * selected into this page and never reach a client component.
   */
  const [withPassport, withTicket] = await Promise.all([
    prisma.flightDetail.findMany({
      where: { userId: team.id, passportFilePath: { not: null } },
      select: { id: true },
    }),
    prisma.flightDetail.findMany({
      where: { userId: team.id, ticketFilePath: { not: null } },
      select: { id: true },
    }),
  ]);
  const passportOnFile = new Set(withPassport.map((f) => f.id));
  const ticketOnFile = new Set(withTicket.map((f) => f.id));

  const rows: RosterFlightRow[] = team.teamMembers.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    serviceNumber: m.serviceNumber,
    rank: m.rank,
    flight: m.flightDetail
      ? {
          id: m.flightDetail.id,
          passengerName: m.flightDetail.passengerName,
          passportNumber: m.flightDetail.passportNumber,
          passportPresent: passportOnFile.has(m.flightDetail.id),
          passportUploadedAt: m.flightDetail.passportUploadedAt,
          ticketPresent: ticketOnFile.has(m.flightDetail.id),
          ticketUploadedAt: m.flightDetail.ticketUploadedAt,
        }
      : null,
  }));

  const unit = team.unit;
  const membersMissingRecord = rows.filter((r) => !r.flight).length;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/host"
        className="inline-flex w-fit items-center gap-1.5 text-[0.8125rem] font-semibold text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={15} aria-hidden />
        Back to {formation.name}
      </Link>

      {/* —— Team header ——————————————————————————————————— */}
      <section className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="admin-page-title m-0">
              {unit?.unitName || `${team.firstName} ${team.lastName}`}
            </h1>
            <p className="m-0 mt-0.5 text-[0.8125rem] text-slate-500">
              {team.firstName} {team.lastName}
              {team.rank ? ` · ${team.rank}` : ""}
              {" · "}
              {displayCountry(team.country)}
              {team.nationality?.trim() ? ` · ${team.nationality}` : ""}
            </p>
          </div>
          {team.finalizedForHostAt ? (
            <span className="whitespace-nowrap rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-green-700">
              Finalized {formatDateShort(team.finalizedForHostAt)}
            </span>
          ) : null}
        </div>
      </section>

      {/* —— Unit details ——————————————————————————————————— */}
      {unit ? (
        <section className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
          <Field label="Unit name" value={unit.unitName} />
          <Field label="Type" value={unit.unitType} />
          <Field label="Branch" value={unit.branch} />
          <Field label="Arm" value={unit.arm} />
          <Field label="Service" value={unit.service} />
          <Field
            label="Patrols requested"
            value={String(unit.patrolsRequested)}
          />
        </section>
      ) : null}

      {/* —— Contacts ———————————————————————————————————— */}
      {unit ? (
        <section className="rounded-2xl border border-gray-200 bg-white">
          <CardHeader icon={<Building2 size={15} aria-hidden />}>
            Contact information
          </CardHeader>
          <div className="grid gap-3 p-[18px] [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
            <Field
              label="Commanding officer"
              value={
                [unit.coRank, unit.coName].filter(Boolean).join(" ") || null
              }
            />
            <Field label="CO email" value={unit.coEmail} />
            <Field label="CO phone" value={unit.coPhone} />
            <Field label="Telephone (mil)" value={unit.telephoneMil} />
            <Field label="Telephone (civ)" value={unit.telephoneCiv} />
            <Field label="Address" value={unit.unitAddress} />
            <Field label="Postcode" value={unit.postcode} />
          </div>
        </section>
      ) : null}

      {/* —— Roster + flights ——————————————————————————————— */}
      <section className="rounded-2xl border border-gray-200 bg-white">
        <CardHeader icon={<Users2 size={15} aria-hidden />}>
          Roster &amp; flight details ({rows.length})
          {membersMissingRecord > 0 ? (
            <span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
              {membersMissingRecord} without a flight record
            </span>
          ) : null}
        </CardHeader>
        <div className="p-[18px]">
          <RosterFlightTable rows={rows} />
        </div>
      </section>

      {/* —— Legacy records not linked to a roster member ——————————— */}
      {team.flightDetails.length > 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-white">
          <CardHeader icon={<Plane size={15} aria-hidden />}>
            Unlinked flight records ({team.flightDetails.length})
          </CardHeader>
          <div className="flex flex-col gap-3 p-[18px]">
            <p className="m-0 text-[12.5px] text-amber-700">
              These records were submitted before flights were tied to a specific
              team member, so they are not attributed to anyone on the roster
              above.
            </p>
            <div className="overflow-x-auto rounded-[10px] border border-brand-line/70">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50">
                    {["Passenger name", "Passport no.", "Passport", "Ticket"].map(
                      (h) => (
                        <th
                          key={h}
                          scope="col"
                          className="whitespace-nowrap border-b border-brand-line/70 px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-500"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {team.flightDetails.map((fd) => (
                    <tr
                      key={fd.id}
                      className="border-b border-brand-line/50 last:border-b-0 odd:bg-white even:bg-slate-50/60"
                    >
                      <td className="px-3 py-2.5 text-[13px] font-semibold text-slate-900">
                        {fd.passengerName || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[12.5px] tabular-nums text-slate-600">
                        {fd.passportNumber || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <DocPill
                          present={passportOnFile.has(fd.id)}
                          uploadedAt={fd.passportUploadedAt}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <DocPill
                          present={ticketOnFile.has(fd.id)}
                          uploadedAt={fd.ticketUploadedAt}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
