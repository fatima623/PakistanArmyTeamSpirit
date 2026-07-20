import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { formatDateShort } from "@/lib/utils";
import { TICKET_CATEGORY_LABELS, type TicketCategory } from "@/lib/constants";
import { SupportTicketsPanel } from "@/components/tickets/SupportTicketsPanel";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.support };
}

export default async function ParticipantTicketsPage() {
  const session = await requireConfirmedParticipant();
  const { t: dict, locale } = await getDictionary();
  const tk = dict.tickets;

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { lastReplyAt: "desc" },
    select: {
      id: true,
      subject: true,
      category: true,
      status: true,
      lastReplyAt: true,
      _count: { select: { messages: true } },
    },
  });

  const items = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    categoryLabel:
      tk.categories[t.category as keyof typeof tk.categories] ??
      TICKET_CATEGORY_LABELS[t.category as TicketCategory] ??
      t.category,
    messageCount: t._count.messages,
    status: t.status,
    updatedLabel: formatDateShort(t.lastReplyAt, locale),
  }));

  return <SupportTicketsPanel tickets={items} />;
}
