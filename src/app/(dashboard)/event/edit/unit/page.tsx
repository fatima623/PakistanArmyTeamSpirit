import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { UNIT_NAMES } from "@/lib/units-list";
import { UnitEditForm } from "@/components/dashboard/UnitEditForm";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";

export const metadata: Metadata = {
  title: "Update unit information",
};

export default async function EditUnitPage() {
  const session = await requireConfirmedParticipant();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      rank: true,
      unit: true,
    },
  });

  if (!user) {
    redirect("/event/login");
  }

  return (
    <>
      <Link href="/event/dashboard" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PatsPortalHeader
          title="Unit information"
          subtitle="Update the details of your registration below."
        />
      </div>
      <UnitEditForm user={user} unitNames={[...UNIT_NAMES]} />
    </>
  );
}
