"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  type TicketCategory,
  type TicketPriority,
} from "@/lib/constants";
import { adminTableActionsCenter, portalTableActionIconView } from "@/lib/admin-ui";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";

export type AdminTicketRowData = {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  requester: string;
  /** Human-friendly "updated" label (e.g. "3h ago"), computed server-side. */
  updated: string;
  /** 1-based row number for the current page. */
  num: number;
};

export function AdminTicketRow({ ticket }: { ticket: AdminTicketRowData }) {
  const router = useRouter();
  const href = `/admin/tickets/${ticket.id}`;

  const stopRowClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <tr
      className="admin-row-hover cursor-pointer"
      onClick={() => router.push(href)}
    >
      <td className="admin-tickets-muted">{ticket.num}</td>
      <td>
        <Link
          href={href}
          className="admin-tickets-subject"
          onClick={stopRowClick}
        >
          {ticket.subject}
        </Link>
      </td>
      <td className="admin-tickets-muted">
        {TICKET_CATEGORY_LABELS[ticket.category as TicketCategory] ??
          ticket.category}
      </td>
      <td>
        <span
          className={`admin-tag-priority admin-tag-priority--${ticket.priority.toLowerCase()}`}
        >
          {TICKET_PRIORITY_LABELS[ticket.priority as TicketPriority] ??
            ticket.priority}
        </span>
      </td>
      <td className="admin-tickets-requester">{ticket.requester}</td>
      <td className="admin-tickets-muted">{ticket.updated}</td>
      <td>
        <TicketStatusBadge status={ticket.status} />
      </td>
      <td onClick={stopRowClick}>
        <div
          className={adminTableActionsCenter}
          role="group"
          aria-label="Ticket actions"
        >
          <Link
            href={href}
            className={portalTableActionIconView}
            aria-label="View ticket"
            title="View ticket"
          >
            <Eye className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </td>
    </tr>
  );
}
