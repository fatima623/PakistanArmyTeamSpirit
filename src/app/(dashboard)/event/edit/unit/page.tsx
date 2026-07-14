import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { UNIT_NAMES } from "@/lib/units-list";
import { UnitEditForm } from "@/components/dashboard/UnitEditForm";
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
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-6">
        <h1 className="pp-page-title">{t.unit.page.title}</h1>
        <p className="pp-page-sub">{t.unit.page.subtitle}</p>
      </header>
      <UnitEditForm user={user} unitNames={[...UNIT_NAMES]} />
    </div>
  );
}
