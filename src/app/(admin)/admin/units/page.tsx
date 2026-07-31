import type { Metadata } from "next";
import Link from "next/link";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { UnitsTable } from "@/components/admin/admin-dynamic";
import { AdminExportButton } from "@/components/admin/AdminExportButton";
import { LiveSearchInput } from "@/components/admin/LiveSearchInput";
import { adminNavLabel } from "@/lib/admin-navigation";

export const metadata: Metadata = {
  title: adminNavLabel("units"),
};

type SearchParams = Promise<{
  search?: string;
  year?: string;
}>;

/** Filter-chip styling (no dependency on the payment/user chip palettes). */
function chipClass(active: boolean): string {
  return active
    ? "rounded-full border border-brand-olive bg-brand-olive px-3 py-1 text-[0.8rem] font-semibold text-white no-underline"
    : "rounded-full border border-brand-line bg-white px-3 py-1 text-[0.8rem] font-medium text-brand-ink no-underline transition-colors hover:border-brand-olive/50";
}

function buildUnitsHref(params: { search: string; year: string }): string {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.year) q.set("year", params.year);
  const s = q.toString();
  return s ? `/admin/units?${s}` : "/admin/units";
}

export default async function AdminUnitsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const year = params.year ?? "";

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

  // Registration-year for every team (search-scoped).
  const rows = units.map((u) => ({
    unit: u,
    year: u.createdAt.getUTCFullYear(),
  }));

  const yearList = [...new Set(rows.map((r) => r.year))].sort((a, b) => b - a);
  const yearNum = year ? Number(year) : null;

  const yearCounts = new Map<number, number>();
  for (const r of rows) {
    yearCounts.set(r.year, (yearCounts.get(r.year) ?? 0) + 1);
  }

  const filteredUnits = rows
    .filter((r) => !yearNum || r.year === yearNum)
    .map((r) => r.unit);

  const exportRows = filteredUnits.map((u) => ({
    Team: u.unitName,
    Branch: u.branch,
    Formation: u.bdeOrFmn,
    Captain: u.coName || `${u.user.firstName} ${u.user.lastName}`,
    Members: u.user._count.teamMembers,
    Status: u.user.approved ? "Active" : "Pending",
    Country: u.user.country ?? "",
    Year: u.createdAt.getUTCFullYear(),
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
          {filteredUnits.length} {filteredUnits.length === 1 ? "team" : "teams"}
          {year ? ` in ${year}` : ""}
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
            "Year",
          ]}
          filename="participating-teams.csv"
          label="Export roster"
        />
      </section>

      {yearList.length > 1 ? (
        <section className="mb-4">
          <p className="mb-1.5 text-[0.72rem] font-bold uppercase tracking-[0.05em] text-muted-foreground">
            By year
          </p>
          <nav className="flex flex-wrap gap-2" aria-label="Filter teams by year">
            <Link
              href={buildUnitsHref({ search, year: "" })}
              className={chipClass(year === "")}
            >
              All ({rows.length})
            </Link>
            {yearList.map((y) => (
              <Link
                key={y}
                href={buildUnitsHref({ search, year: String(y) })}
                className={chipClass(year === String(y))}
              >
                {y} ({yearCounts.get(y) ?? 0})
              </Link>
            ))}
          </nav>
        </section>
      ) : null}

      <UnitsTable units={filteredUnits} />
    </div>
  );
}
