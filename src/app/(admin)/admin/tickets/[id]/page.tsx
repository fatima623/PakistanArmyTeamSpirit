import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/cached-auth";
import { cn, formatDateTime } from "@/lib/utils";
import {
  TICKET_CATEGORY_LABELS,
  type TicketCategory,
} from "@/lib/constants";
import { adminSurface } from "@/lib/admin-ui";
import {
  TicketPriorityTag,
  TicketStatusBadge,
} from "@/components/tickets/TicketStatusBadge";
import { TicketThread } from "@/components/tickets/TicketThread";
import { AdminTicketControls } from "@/components/admin/AdminTicketControls";
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
    <div className="mx-auto max-w-4xl">
      <AdminBreadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Support Tickets", href: "/admin/tickets" },
          { label: ticket.subject },
        ]}
      />

      <div className={cn(adminSurface, "mb-5 p-6")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="admin-page-title">{ticket.subject}</h1>
            <p className="admin-muted mt-1 text-sm">
              {TICKET_CATEGORY_LABELS[ticket.category as TicketCategory] ??
                ticket.category}{" "}
              · Opened {formatDateTime(ticket.createdAt)}
            </p>
            <p className="admin-muted mt-1 text-sm">
              Raised by {ticket.user.firstName} {ticket.user.lastName} ·{" "}
              <Link href={`/admin/users/${ticket.user.id}`} className="admin-link">
                {ticket.user.email}
              </Link>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityTag priority={ticket.priority} />
          </div>
        </div>
      </div>

      <div className={cn(adminSurface, "mb-5 p-6")}>
        <TicketThread messages={ticket.messages} />
      </div>

      <div className={cn(adminSurface, "p-6")}>
        <h2 className="admin-section-title mb-4">Respond &amp; manage</h2>
        <AdminTicketControls
          ticketId={ticket.id}
          status={ticket.status}
          priority={ticket.priority}
          assignedToId={ticket.assignedToId}
          currentAdminId={session?.user?.id ?? ""}
        />
      </div>
    </div>
  );
}
