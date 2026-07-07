import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  FileCheck2,
  Globe2,
  Info,
  Lock,
  Plane,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { getWorkflowSettings } from "@/lib/workflow-settings";
import {
  canViewHostInfo,
  workflowUserSelect,
} from "@/lib/participant-workflow";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";

export const metadata: Metadata = {
  title: "Host Information",
};

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default async function HostInfoPage() {
  const session = await requireConfirmedParticipant();

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        ...workflowUserSelect,
        unit: { select: { unitName: true } },
      },
    }),
    getWorkflowSettings(),
  ]);

  if (!user) {
    redirect("/event/login");
  }

  const available = canViewHostInfo(user, settings);

  if (!available) {
    return (
      <div className="team-page">
        <Link href="/event/dashboard" className="portal-back-link mb-4">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
        <PatsPortalHeader
          title="Host Information"
          subtitle="Finalized hosting and arrival information from the organizers."
        />
        <section className="portal-card pats-panel">
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200">
              <Lock className="h-6 w-6 text-slate-500" aria-hidden />
            </span>
            <h2 className="portal-h2">Not available yet</h2>
            <p className="mx-auto max-w-md text-sm text-slate-600">
              The Host Information section becomes visible after your flight
              details have been reviewed and finalized by the administration
              and the organizers publish the hosting information.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const [hostContentRow, countryTeams, teamMembers, flights] =
    await Promise.all([
      prisma.siteSettings.findUnique({
        where: { id: "singleton" },
        select: { hostInfoContent: true },
      }),
      prisma.user.groupBy({
        by: ["country"],
        where: { role: "user", teamRegisteredAt: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
      }),
      prisma.teamMember.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          fullName: true,
          serviceNumber: true,
          rank: true,
          gender: true,
        },
      }),
      prisma.flightDetail.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          passengerName: true,
          passportNumber: true,
          passportFileName: true,
          ticketFileName: true,
          teamMember: { select: { fullName: true, rank: true } },
        },
      }),
    ]);

  const totalTeams = countryTeams.reduce((sum, c) => sum + c._count._all, 0);
  const hostHtml = hostContentRow?.hostInfoContent
    ? sanitizeNewsContent(hostContentRow.hostInfoContent)
    : null;

  return (
    <div className="team-page">
      <Link href="/event/dashboard" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>
      <PatsPortalHeader
        title="Host Information"
        subtitle="Finalized hosting, team, and arrival information — read-only."
      />

      <div className="space-y-5">
        {/* Summary cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Globe2 className="h-5 w-5" aria-hidden />}
            label="Participating countries"
            value={String(countryTeams.length)}
          />
          <StatCard
            icon={<Users className="h-5 w-5" aria-hidden />}
            label="Registered teams"
            value={String(totalTeams)}
          />
          <StatCard
            icon={<Plane className="h-5 w-5" aria-hidden />}
            label="Your finalized travelers"
            value={String(flights.length)}
          />
        </div>

        {/* Organizer-provided host information */}
        {hostHtml ? (
          <section className="portal-card pats-panel">
            <h2 className="portal-h2 mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-emerald-700" aria-hidden />
              Hosting &amp; arrival information
            </h2>
            <div
              className="prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: hostHtml }}
            />
          </section>
        ) : null}

        {/* Country-wise team numbers */}
        <section className="portal-card pats-panel">
          <h2 className="portal-h2 mb-3">Country-wise team numbers</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="w-14 px-3 py-2.5">
                    S.No
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Country
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Teams
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {countryTeams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      No registered teams yet.
                    </td>
                  </tr>
                ) : (
                  countryTeams.map((c, i) => (
                    <tr key={c.country ?? "unknown"}>
                      <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">
                        {c.country ?? "Unspecified"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-800">
                        {c._count._all}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Own team details */}
        <section className="portal-card pats-panel">
          <h2 className="portal-h2 mb-3">
            Your team{user.unit?.unitName ? ` — ${user.unit.unitName}` : ""}
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="w-14 px-3 py-2.5">
                    S.No
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
                  <th scope="col" className="px-3 py-2.5">
                    Gender
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {teamMembers.map((m, i) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      {m.serviceNumber}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {m.rank || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-800">{m.fullName}</td>
                    <td className="px-3 py-2.5 text-slate-700">{m.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Finalized flight information */}
        <section className="portal-card pats-panel">
          <h2 className="portal-h2 mb-3">Finalized flight information</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[560px] border-collapse text-sm">
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
                    Documents
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {flights.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      No flight records.
                    </td>
                  </tr>
                ) : (
                  flights.map((f) => (
                    <tr key={f.id}>
                      <td className="px-3 py-2.5 text-slate-800">
                        {f.teamMember
                          ? `${f.teamMember.rank ? `${f.teamMember.rank} ` : ""}${f.teamMember.fullName}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800">
                        {f.passengerName}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700">
                        {f.passportNumber}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                          <FileCheck2
                            className={`h-4 w-4 ${f.passportFileName ? "text-emerald-600" : "text-slate-300"}`}
                            aria-hidden
                          />
                          Passport
                          <FileCheck2
                            className={`h-4 w-4 ${f.ticketFileName ? "text-emerald-600" : "text-slate-300"}`}
                            aria-hidden
                          />
                          Ticket
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            This information is read-only. Contact the organizers for any
            corrections.
          </p>
        </section>
      </div>
    </div>
  );
}
