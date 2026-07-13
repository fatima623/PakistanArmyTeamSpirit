"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageSquare, Plus } from "lucide-react";

import { NewTicketForm } from "@/components/tickets/NewTicketForm";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { normalizeTicketStatus } from "@/lib/constants";

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
  const { t: i18n } = useI18n();
  const tk = i18n.tickets;

  return (
    <div className="flex flex-col gap-5">
      {!creating ? (
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-slate-800">
              {tk.panel.title}
            </h1>
            <div className="mt-[0.3rem] text-[0.875rem] !text-slate-600">
              {tk.panel.subtitle}
            </div>
          </div>
          <Button
            className="cp-btn-primary shrink-0 !rounded-lg"
            onClick={() => setCreating(true)}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            {tk.panel.newTicket}
          </Button>
        </header>
      ) : null}

      <NewTicketForm open={creating} onOpenChange={setCreating} />

      {!creating ? (
        tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-[0.6rem] rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center text-sm text-slate-500">
            <MessageSquare className="h-6 w-6 opacity-60" aria-hidden />
            <p className="text-slate-500">{tk.panel.empty}</p>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-[0.6rem] p-0">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/event/tickets/${t.id}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-[1.1rem] py-[0.8rem] no-underline shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,background] duration-150 hover:border-slate-300 hover:shadow-[0_3px_12px_rgba(15,23,42,0.09)]"
                >
                  <span className="support-ticket__icon" aria-hidden>
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-auto">
                    <div className="truncate text-[0.92rem] font-semibold leading-[1.35] text-slate-800">
                      {t.subject}
                    </div>
                    <div className="mt-[0.2rem] text-[0.76rem] leading-[1.4] !text-slate-500">
                      {tk.panel.listMeta(t.categoryLabel, t.messageCount, t.updatedLabel)}
                    </div>
                  </div>
                  <div className="inline-flex shrink-0 items-center gap-[0.65rem]">
                    <TicketStatusBadge
                      status={t.status}
                      label={
                        tk.statuses[
                          normalizeTicketStatus(t.status) as keyof typeof tk.statuses
                        ]
                      }
                    />
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
