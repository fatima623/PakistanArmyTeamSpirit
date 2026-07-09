import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

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

  return (
    <div className="admin-ticket-detail">
      <AdminBreadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Support Tickets", href: "/admin/tickets" },
          { label: ticket.subject },
        ]}
      />

      <header className="admin-ticket-detail-hero">
        <div className="min-w-0">
          <h1 className="admin-ticket-detail-subject">{ticket.subject}</h1>
          <div className="admin-ticket-detail-meta">
            <span>
              {TICKET_CATEGORY_LABELS[ticket.category as TicketCategory] ??
                ticket.category}
            </span>
            <span className="admin-ticket-detail-dot" aria-hidden>
              ·
            </span>
            <span>Opened {formatDateTime(ticket.createdAt)}</span>
            <span className="admin-ticket-detail-dot" aria-hidden>
              ·
            </span>
            <span>
              Raised by {ticket.user.firstName} {ticket.user.lastName} ·{" "}
              <Link
                href={`/admin/users/${ticket.user.id}`}
                className="admin-link"
              >
                {ticket.user.email}
              </Link>
            </span>
          </div>
        </div>
        <div className="admin-ticket-detail-badges">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityTag priority={ticket.priority} />
        </div>
      </header>

      <div className="admin-ticket-detail-grid">
        <div className="admin-ticket-detail-main">
          <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
            <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
              <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">Conversation</h3>
            </div>
            <div className="px-[1.1rem] pb-4 pt-[0.9rem]">
              <TicketThread messages={ticket.messages} />
            </div>
          </section>

          <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
            <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
              <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">Reply</h3>
            </div>
            <div className="px-[1.1rem] pb-4 pt-[0.9rem]">
              <TicketReplyForm ticketId={ticket.id} />
            </div>
          </section>
        </div>

        <aside className="admin-ticket-detail-aside">
          <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
            <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
              <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">Manage</h3>
            </div>
            <div className="px-[1.1rem] pb-4 pt-[0.9rem]">
              <TicketManagePanel
                ticketId={ticket.id}
                status={ticket.status}
                priority={ticket.priority}
                assignedToId={ticket.assignedToId}
                currentAdminId={session?.user?.id ?? ""}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
