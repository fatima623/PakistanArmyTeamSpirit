import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { LiveSearchInput } from "@/components/admin/LiveSearchInput";
import {
  adminFilterChip,
  adminFilterChipActive,
  adminFilterChipInactive,
  adminSurface,
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

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "–";
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
    <div className={cn(adminSurface, "p-6")}>
      <header className="admin-users-page-header mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="admin-users-panel-title">Support tickets</h2>
          <p className="admin-users-page-desc">
            Participant support tickets. Open one to reply and update its status.
          </p>
        </div>
        <span className="admin-users-count-badge">
          {statusCounts.all} {statusCounts.all === 1 ? "ticket" : "tickets"}
        </span>
      </header>

      <section className="mb-5 flex flex-wrap items-center gap-3">
        <LiveSearchInput
          paramName="search"
          placeholder="Search subject, name, email…"
          ariaLabel="Search tickets"
          className="relative"
          inputClassName="admin-input pl-8"
          iconClassName="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cp-khaki"
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
        <p className="admin-team-empty">No tickets found</p>
      ) : (
        <ul className="admin-tickets-list">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link href={`/admin/tickets/${t.id}`} className="admin-ticket-row">
                <div className="admin-ticket-row__main">
                  <div className="admin-ticket-row__head">
                    <span className="admin-ticket-row__ref">{ticketRef(t.id)}</span>
                    <span className="admin-ticket-row__subject">{t.subject}</span>
                    <span
                      className={`admin-ticket-row__priority admin-ticket-row__priority--${t.priority.toLowerCase()}`}
                    >
                      {TICKET_PRIORITY_LABELS[t.priority as TicketPriority] ??
                        t.priority}
                    </span>
                  </div>
                  <div className="admin-ticket-row__cat">
                    {TICKET_CATEGORY_LABELS[t.category as TicketCategory] ??
                      t.category}
                  </div>
                </div>
                <div className="admin-ticket-row__aside">
                  <span className="admin-users-avatar" aria-hidden>
                    {initials(t.user.firstName, t.user.lastName)}
                  </span>
                  <div className="admin-ticket-row__who">
                    <span className="admin-ticket-row__name">
                      {t.user.firstName} {t.user.lastName}
                    </span>
                    <span className="admin-ticket-row__metaline">
                      {t._count.messages} · {timeAgo(t.lastReplyAt, now)}
                    </span>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
