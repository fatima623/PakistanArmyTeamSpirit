import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AdminUnitEditForm } from "@/components/admin/AdminUnitEditForm";
import { adminNavLabel } from "@/lib/admin-navigation";
import { Button } from "@/components/ui/button";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: adminNavLabel("units"),
};

export default async function AdminUnitEditPage({ params }: PageProps) {
  const { id } = await params;

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      user: {
        select: { firstName: true, lastName: true, rank: true },
      },
    },
  });

  if (!unit) {
    notFound();
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="admin-page-title">{unit.unitName}</h2>
        <Link href="/admin/units">
          <Button size="sm" variant="adminOutline">
            Back
          </Button>
        </Link>
      </div>
      <AdminUnitEditForm unit={unit} />
    </>
  );
}
