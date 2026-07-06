import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireParticipantSession } from "@/lib/require-participant";
import { formatDateShort } from "@/lib/utils";
import { TICKET_CATEGORY_LABELS, type TicketCategory } from "@/lib/constants";
import { SupportTicketsPanel } from "@/components/tickets/SupportTicketsPanel";

export const metadata: Metadata = {
  title: "Support",
};

export default async function ParticipantTicketsPage() {
  const session = await requireParticipantSession();

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
      TICKET_CATEGORY_LABELS[t.category as TicketCategory] ?? t.category,
    messageCount: t._count.messages,
    status: t.status,
    updatedLabel: formatDateShort(t.lastReplyAt),
  }));

  return (
    <div className="support-page">
      <header className="support-page__header">
        <h1 className="support-page__title">Support</h1>
        <div className="support-page__subtitle">
          Raise a ticket and our team will get back to you.
        </div>
      </header>

      <SupportTicketsPanel tickets={items} />
    </div>
  );
}
