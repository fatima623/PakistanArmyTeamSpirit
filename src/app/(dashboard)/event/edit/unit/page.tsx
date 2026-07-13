import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { UNIT_NAMES } from "@/lib/units-list";
import { UnitEditForm } from "@/components/dashboard/UnitEditForm";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Update unit information",
};

export default async function EditUnitPage() {
  const session = await requireConfirmedParticipant();
  const { t } = await getDictionary();

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
    <div className="mx-auto w-full max-w-3xl">
      <Link href="/event/dashboard" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t.common.backToDashboard}
      </Link>
      <div className="mb-6">
        <PatsPortalHeader
          title={t.unit.page.title}
          subtitle={t.unit.page.subtitle}
        />
      </div>
      <UnitEditForm user={user} unitNames={[...UNIT_NAMES]} />
    </div>
  );
}
