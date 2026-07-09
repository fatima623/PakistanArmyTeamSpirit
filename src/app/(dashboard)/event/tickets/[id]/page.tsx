import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { formatDateTime } from "@/lib/utils";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS,
  type TicketCategory,
} from "@/lib/constants";
import { PatsPortalHeader } from "@/components/pats/PatsPortalHeader";
import {
  TicketPriorityTag,
  TicketStatusBadge,
} from "@/components/tickets/TicketStatusBadge";
import { TicketThread } from "@/components/tickets/TicketThread";
import { TicketReplyBox } from "@/components/tickets/TicketReplyBox";

export const metadata: Metadata = {
  title: "Support ticket",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function ParticipantTicketDetailPage({
  params,
}: PageProps) {
  const session = await requireConfirmedParticipant();
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      subject: true,
      category: true,
      status: true,
      priority: true,
      createdAt: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          authorRole: true,
          authorName: true,
          body: true,
          createdAt: true,
        },
      },
    },
  });

  if (!ticket || ticket.userId !== session.user.id) {
    notFound();
  }

  const closed = ticket.status === TICKET_STATUS.CLOSED;

  return (
    <>
      <Link href="/event/tickets" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to support
      </Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PatsPortalHeader
          title={ticket.subject}
          subtitle={`${
            TICKET_CATEGORY_LABELS[ticket.category as TicketCategory] ??
            ticket.category
          } · Opened ${formatDateTime(ticket.createdAt)}`}
        />
      </div>

      <div className="portal-form-card">
        <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-brand-line pb-4">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityTag priority={ticket.priority} />
        </div>

        <TicketThread messages={ticket.messages} />

        <TicketReplyBox ticketId={ticket.id} closed={closed} />
      </div>
    </>
  );
}
