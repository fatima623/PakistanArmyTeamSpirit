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
    <div className="flex flex-col gap-4">
      <NewTicketForm open={creating} onOpenChange={setCreating} />

      {!creating ? (
        tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-[0.6rem] rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center text-sm text-slate-500">
            <MessageSquare className="h-6 w-6 opacity-60" aria-hidden />
            <p className="text-slate-500">
              You have no support tickets yet. Raise one above if you need help.
            </p>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-[0.6rem] p-0">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/event/tickets/${t.id}`}
                  className="group flex items-center justify-between gap-4 border border-slate-200 bg-white px-[1.1rem] py-[0.8rem] no-underline shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,background] duration-150 hover:border-slate-300 hover:shadow-[0_3px_12px_rgba(15,23,42,0.09)]"
                >
                  <span className="support-ticket__icon" aria-hidden>
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-auto">
                    <div className="truncate text-[0.92rem] font-semibold leading-[1.35] text-slate-800">
                      {t.subject}
                    </div>
                    <div className="mt-[0.2rem] text-[0.76rem] leading-[1.4] !text-slate-500">
                      {t.categoryLabel} · {t.messageCount} message
                      {t.messageCount === 1 ? "" : "s"} · Updated {t.updatedLabel}
                    </div>
                  </div>
                  <div className="inline-flex shrink-0 items-center gap-[0.65rem]">
                    <TicketStatusBadge status={t.status} />
                    <ChevronRight
                      className="h-4 w-4 text-slate-400 transition-transform duration-150 group-hover:translate-x-[2px]"
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
