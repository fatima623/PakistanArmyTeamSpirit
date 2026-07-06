"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageSquare } from "lucide-react";

import { NewTicketForm } from "@/components/tickets/NewTicketForm";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";

export type SupportTicketListItem = {
  id: string;
  subject: string;
  categoryLabel: string;
  messageCount: number;
  status: string;
  updatedLabel: string;
};

/**
 * Participant support view. While the new-ticket form is open the existing
 * ticket list is hidden to keep focus on composing; once the form closes
 * (cancel or submit) the list returns.
 */
export function SupportTicketsPanel({
  tickets,
}: {
  tickets: SupportTicketListItem[];
}) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="support-tickets">
      <NewTicketForm open={creating} onOpenChange={setCreating} />

      {!creating ? (
        tickets.length === 0 ? (
          <div className="support-tickets__empty">
            <MessageSquare className="h-6 w-6 opacity-60" aria-hidden />
            <p>You have no support tickets yet. Raise one above if you need help.</p>
          </div>
        ) : (
          <ul className="support-tickets__list">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/event/tickets/${t.id}`} className="support-ticket">
                  <span className="support-ticket__icon" aria-hidden>
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <div className="support-ticket__body">
                    <div className="support-ticket__subject">{t.subject}</div>
                    <div className="support-ticket__meta">
                      {t.categoryLabel} · {t.messageCount} message
                      {t.messageCount === 1 ? "" : "s"} · Updated {t.updatedLabel}
                    </div>
                  </div>
                  <div className="support-ticket__aside">
                    <TicketStatusBadge status={t.status} />
                    <ChevronRight
                      className="support-ticket__chev h-4 w-4"
                      aria-hidden
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
