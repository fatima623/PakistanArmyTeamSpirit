import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { formatDateShort } from "@/lib/utils";
import { TICKET_CATEGORY_LABELS, type TicketCategory } from "@/lib/constants";
import { SupportTicketsPanel } from "@/components/tickets/SupportTicketsPanel";

export const metadata: Metadata = {
  title: "Support",
};

export default async function ParticipantTicketsPage() {
  const session = await requireConfirmedParticipant();

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
    <div>
      <header className="mb-5">
        <h1 className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-slate-800">
          Support
        </h1>
        <div className="mt-[0.3rem] text-[0.875rem] !text-slate-600">
          Raise a ticket and our team will get back to you.
        </div>
      </header>

      <SupportTicketsPanel tickets={items} />
    </div>
  );
}
