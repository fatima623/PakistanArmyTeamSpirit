import type { Metadata } from "next";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { UnitsTable } from "@/components/admin/admin-dynamic";
import { AdminExportButton } from "@/components/admin/AdminExportButton";
import { LiveSearchInput } from "@/components/admin/LiveSearchInput";
import { adminNavLabel } from "@/lib/admin-navigation";

export const metadata: Metadata = {
  title: adminNavLabel("units"),
};

type SearchParams = Promise<{ search?: string }>;

export default async function AdminUnitsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = params.search ?? "";

  const where: Prisma.UnitWhereInput = search
    ? {
        OR: [
          { unitName: { contains: search } },
          { coName: { contains: search } },
          {
            user: {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
              ],
            },
          },
        ],
      }
    : {};

  const units = await prisma.unit.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          approved: true,
          country: true,
          nationality: true,
          _count: { select: { teamMembers: true } },
          teamMembers: {
            select: {
              id: true,
              fullName: true,
              serviceNumber: true,
              rank: true,
              serviceArm: true,
              gender: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const exportRows = units.map((u) => ({
    Team: u.unitName,
    Branch: u.branch,
    Formation: u.bdeOrFmn,
    Captain: u.coName || `${u.user.firstName} ${u.user.lastName}`,
    Members: u.user._count.teamMembers,
    Status: u.user.approved ? "Active" : "Pending",
    Country: u.user.country ?? "",
  }));

  return (
    <div className="admin-fade-in-up">
      <section className="mb-4 flex flex-wrap items-center gap-3">
        <LiveSearchInput
          paramName="search"
          placeholder="Search teams or units..."
          ariaLabel="Search teams"
          className="relative min-w-[220px] flex-[1_1_260px]"
          inputClassName="h-11 w-full rounded-[10px] bg-white pl-10 pr-3.5 text-sm font-medium text-brand-ink shadow-sm placeholder:text-slate-400 focus-visible:border-brand-olive/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-olive/15 focus-visible:ring-offset-0"
          iconClassName="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground opacity-50"
        />
        <span className="whitespace-nowrap px-0.5 text-[0.78rem] font-semibold text-muted-foreground">
          {units.length} {units.length === 1 ? "team" : "teams"}
        </span>
        <AdminExportButton
          rows={exportRows}
          columns={[
            "Team",
            "Branch",
            "Formation",
            "Captain",
            "Members",
            "Status",
            "Country",
          ]}
          filename="participating-teams.csv"
          label="Export roster"
        />
      </section>

      <UnitsTable units={units} />
    </div>
  );
}
