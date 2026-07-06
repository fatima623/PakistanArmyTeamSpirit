import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/cached-auth";
import { isApplicationApproved } from "@/lib/user-status";
import { resolveParticipantJourneyStage } from "@/lib/participant-journey";

import { PatsPortalNav } from "./PatsPortalNav";

export async function PatsPortalNavServer() {
  const session = await getCachedSession();
  let showPaymentLink = false;
  let stage: 1 | 2 | 3 | undefined;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        applicationStatus: true,
        paymentStatus: true,
        approved: true,
        suspended: true,
      },
    });
    if (user) {
      showPaymentLink =
        !user.suspended && isApplicationApproved(user.applicationStatus);
      stage = resolveParticipantJourneyStage({
        applicationStatus: user.applicationStatus,
        paymentStatus: user.paymentStatus,
        approved: user.approved,
      });
    }
  }

  return <PatsPortalNav showPaymentLink={showPaymentLink} stage={stage} />;
}
