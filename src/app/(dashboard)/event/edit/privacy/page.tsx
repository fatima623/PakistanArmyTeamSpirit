import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { PrivacyForm } from "@/components/dashboard/PrivacyForm";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function EditPrivacyPage() {
  const session = await requireConfirmedParticipant();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { privacyAccepted: true },
  });

  return (
    <>
      <Link href="/event/dashboard" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PatsPortalHeader
          title="Privacy policy"
          subtitle="Review and accept the competition privacy terms."
        />
      </div>
      <PrivacyForm initialAccepted={user?.privacyAccepted ?? false} />
    </>
  );
}
