import type { Metadata } from "next";
import "@/app/admin-units-reference.css";

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
    <div className="admin-units-page admin-fade-in-up">
      <section className="admin-units-controls">
        <LiveSearchInput
          paramName="search"
          placeholder="Search teams or units..."
          ariaLabel="Search teams"
          className="admin-unit-search-field"
          inputClassName="admin-input admin-unit-search-input"
          iconClassName="admin-unit-search-icon"
        />
        <span className="admin-units-count">
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
