import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { formatDateShort } from "@/lib/utils";
import { SupportTicketsPanel } from "@/components/tickets/SupportTicketsPanel";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.support };
}

export default async function ParticipantTicketsPage() {
  const session = await requireConfirmedParticipant();
  const { locale } = await getDictionary();

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { lastReplyAt: "desc" },
    select: {
      id: true,
      subject: true,
      status: true,
      lastReplyAt: true,
      _count: { select: { messages: true } },
    },
  });

  const items = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    messageCount: t._count.messages,
    status: t.status,
    updatedLabel: formatDateShort(t.lastReplyAt, locale),
  }));

  return <SupportTicketsPanel tickets={items} />;
}
