import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { LifeBuoy } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { LiveSearchInput } from "@/components/admin/LiveSearchInput";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import {
  adminFilterChip,
  adminFilterChipActive,
  adminFilterChipInactive,
} from "@/lib/admin-ui";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS,
  TICKET_STATUS_LABELS,
  normalizeTicketStatus,
  type TicketCategory,
  type TicketPriority,
} from "@/lib/constants";
import { adminNavLabel } from "@/lib/admin-navigation";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";

export const metadata: Metadata = {
  title: adminNavLabel("tickets"),
};

type SearchParams = Promise<{ status?: string; search?: string }>;

const FILTERS = [
  "all",
  TICKET_STATUS.OPEN,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.RESOLVED,
  TICKET_STATUS.CLOSED,
] as const;

function ticketRef(id: string): string {
  return `TK-${id.slice(-5).toUpperCase()}`;
}

function timeAgo(date: Date, now: Date): string {
  const mins = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const search = params.search ?? "";

  const where: Prisma.SupportTicketWhereInput = {};
  if (status !== "all") {
    where.status = normalizeTicketStatus(status);
  }
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { user: { email: { contains: search } } },
      { user: { firstName: { contains: search } } },
      { user: { lastName: { contains: search } } },
    ];
  }

  const [tickets, counts] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: [{ lastReplyAt: "desc" }],
      take: 200,
      select: {
        id: true,
        subject: true,
        category: true,
        status: true,
        priority: true,
        lastReplyAt: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.supportTicket.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const statusCounts: Record<string, number> = { all: 0 };
  for (const row of counts) {
    statusCounts[row.status] = row._count._all;
    statusCounts.all += row._count._all;
  }
  const now = new Date();

  return (
    <div className="admin-fade-in-up">
      <section className="admin-tickets-controls mb-4 flex flex-wrap items-center gap-3">
        <LiveSearchInput
          paramName="search"
          placeholder="Search subject, name, email…"
          ariaLabel="Search tickets"
          className="admin-unit-search-field"
          inputClassName="admin-input admin-unit-search-input"
          iconClassName="admin-unit-search-icon"
        />
        <nav className="flex flex-wrap gap-2" aria-label="Filter tickets">
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={`/admin/tickets?status=${f}&search=${encodeURIComponent(
                search
              )}`}
              className={cn(
                adminFilterChip,
                status === f ? adminFilterChipActive : adminFilterChipInactive
              )}
            >
              {f === "all" ? "All" : TICKET_STATUS_LABELS[f]}
              <span className="ml-1.5 opacity-70">{statusCounts[f] ?? 0}</span>
            </Link>
          ))}
        </nav>
      </section>

      {tickets.length === 0 ? (
        <AdminEmptyState
          icon={LifeBuoy}
          title="No tickets found"
          description="Participant support tickets will appear here. Adjust the filters to widen your search."
        />
      ) : (
        <div className="admin-tickets-table-wrap">
          <table className="admin-data-table admin-tickets-table w-full">
            <thead className="admin-table-head">
              <tr>
                <th scope="col">Ref</th>
                <th scope="col">Subject</th>
                <th scope="col">Category</th>
                <th scope="col">Priority</th>
                <th scope="col">Requester</th>
                <th scope="col">Updated</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="admin-row-hover">
                  <td className="admin-tickets-ref">{ticketRef(t.id)}</td>
                  <td>
                    <Link
                      href={`/admin/tickets/${t.id}`}
                      className="admin-tickets-subject"
                    >
                      {t.subject}
                    </Link>
                  </td>
                  <td className="admin-tickets-muted">
                    {TICKET_CATEGORY_LABELS[t.category as TicketCategory] ??
                      t.category}
                  </td>
                  <td>
                    <span
                      className={`admin-tag-priority admin-tag-priority--${t.priority.toLowerCase()}`}
                    >
                      {TICKET_PRIORITY_LABELS[t.priority as TicketPriority] ??
                        t.priority}
                    </span>
                  </td>
                  <td className="admin-tickets-requester">
                    {t.user.firstName} {t.user.lastName}
                  </td>
                  <td className="admin-tickets-muted">
                    {timeAgo(t.lastReplyAt, now)}
                  </td>
                  <td>
                    <TicketStatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
