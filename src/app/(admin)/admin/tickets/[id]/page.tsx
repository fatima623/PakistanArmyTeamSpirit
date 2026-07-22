import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/cached-auth";
import { formatDateTime } from "@/lib/utils";
import {
  TICKET_CATEGORY_LABELS,
  type TicketCategory,
} from "@/lib/constants";
import {
  TicketPriorityTag,
  TicketStatusBadge,
} from "@/components/tickets/TicketStatusBadge";
import { TicketThread } from "@/components/tickets/TicketThread";
import {
  TicketManagePanel,
  TicketReplyForm,
} from "@/components/admin/AdminTicketControls";

export const metadata: Metadata = {
  title: "Support ticket",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminTicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getCachedSession();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: {
      id: true,
      subject: true,
      category: true,
      status: true,
      priority: true,
      createdAt: true,
      assignedToId: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
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

  if (!ticket) {
    notFound();
  }

  const categoryLabel =
    TICKET_CATEGORY_LABELS[ticket.category as TicketCategory] ??
    ticket.category;

  return (
    <div className="admin-ticket-detail">
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-1 self-start text-[0.78rem] font-medium text-muted-foreground no-underline transition-colors hover:text-green-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to tickets
      </Link>

      <header className="flex items-start gap-3.5 rounded-[14px] border border-brand-line/60 bg-white px-[1.15rem] py-[1rem] shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
          <MessageCircle className="h-[1.35rem] w-[1.35rem]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h1 className="m-0 text-[1.15rem] font-bold leading-[1.25] tracking-[-0.02em] text-brand-ink">
              {ticket.subject}
            </h1>
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityTag priority={ticket.priority} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.8rem] text-muted-foreground">
            <span>{categoryLabel}</span>
            <span className="text-brand-line" aria-hidden>
              ·
            </span>
            <span>Opened {formatDateTime(ticket.createdAt)}</span>
          </div>
          <div className="mt-1 text-[0.8rem] text-muted-foreground">
            Raised by{" "}
            <span className="font-medium text-brand-ink">
              {ticket.user.firstName} {ticket.user.lastName}
            </span>{" "}
            ·{" "}
            <Link
              href={`/admin/users/${ticket.user.id}`}
              className="admin-link break-all"
            >
              {ticket.user.email}
            </Link>
          </div>
        </div>
      </header>

      <div className="admin-ticket-detail-grid">
        <div className="admin-ticket-detail-main">
          <section className="overflow-hidden rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
            <div className="border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
              <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">
                Conversation
              </h3>
            </div>
            <div className="bg-[rgba(240,244,238,0.7)] px-[1.1rem] pb-4 pt-[0.9rem]">
              <TicketThread messages={ticket.messages} />
            </div>
            <div className="border-t border-brand-line/60 bg-white px-[1.1rem] py-[0.85rem]">
              <TicketReplyForm ticketId={ticket.id} />
            </div>
          </section>
        </div>

        <aside className="admin-ticket-detail-aside flex flex-col gap-[14px]">
         
         
        </aside>
      </div>
    </div>
  );
}
