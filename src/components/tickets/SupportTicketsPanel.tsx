"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  HelpCircle,
  Loader2,
  MessageSquare,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { FaqAccordion } from "@/components/tickets/FaqAccordion";
import { NewTicketForm } from "@/components/tickets/NewTicketForm";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { normalizeTicketStatus, TICKET_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type SupportTicketListItem = {
  id: string;
  subject: string;
  messageCount: number;
  status: string;
  updatedLabel: string;
};

/**
 * Participant "Query / FAQs" view.
 *
 * The FAQ block is collapsed behind a disclosure button so it no longer pushes
 * the query list far down the page: participants open it only when they want to
 * scan the common answers, and it stays out of the way otherwise. The queries
 * themselves render as a proper table — subject, date, status and per-row
 * Resolve / Close actions — so a participant can read status at a glance and
 * wrap up a thread without opening it. While the new-query form is open the FAQ
 * button and the table are hidden to keep focus on composing; once the form
 * closes (cancel or submit) they return.
 */
export function SupportTicketsPanel({
  tickets,
}: {
  tickets: SupportTicketListItem[];
}) {
  const [creating, setCreating] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();
  const { t: i18n } = useI18n();
  const tk = i18n.tickets;
  const faqPanelId = useId();

  const updateStatus = async (
    id: string,
    status: string,
    successMsg: string
  ) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(successMsg);
        router.refresh();
        return;
      }
      toast.error(i18n.common.toasts.genericError);
    } catch {
      toast.error(i18n.common.toasts.genericError);
    } finally {
      setBusyId(null);
    }
  };

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
        <div className="flex flex-col gap-3">
          <button
            type="button"
            aria-expanded={showFaq}
            aria-controls={faqPanelId}
            onClick={() => setShowFaq((v) => !v)}
            className="flex items-center gap-2.5 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[0.9rem] font-semibold !text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <HelpCircle
              className="h-[1.1rem] w-[1.1rem] shrink-0 text-emerald-600"
              aria-hidden
            />
            {showFaq ? tk.faq.hide : tk.faq.show}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                showFaq && "rotate-180 text-emerald-600"
              )}
              aria-hidden
            />
          </button>

          <div id={faqPanelId}>
            {showFaq ? (
              <FaqAccordion
                title={tk.faq.title}
                subtitle={tk.faq.subtitle}
                items={tk.faq.items}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {!creating ? (
        tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-[0.6rem] rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center text-sm text-slate-500">
            <MessageSquare className="h-6 w-6 opacity-60" aria-hidden />
            <p className="text-slate-500">{tk.panel.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[640px] table-fixed border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.04em] !text-slate-500">
                  <th scope="col" className="w-1/5 px-3 py-2.5 text-center">
                    {tk.table.sNo}
                  </th>
                  <th scope="col" className="w-1/5 px-3 py-2.5 text-left">
                    {tk.table.subject}
                  </th>
                  <th scope="col" className="w-1/5 px-3 py-2.5 text-center">
                    {tk.table.date}
                  </th>
                  <th scope="col" className="w-1/5 px-3 py-2.5 text-center">
                    {tk.table.status}
                  </th>
                  <th scope="col" className="w-1/5 px-3 py-2.5 text-center">
                    {tk.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tickets.map((t, i) => {
                  const status = normalizeTicketStatus(t.status);
                  const canResolve =
                    status === TICKET_STATUS.OPEN ||
                    status === TICKET_STATUS.IN_PROGRESS;
                  const canClose = status !== TICKET_STATUS.CLOSED;
                  const busy = busyId === t.id;

                  return (
                    <tr key={t.id}>
                      <td className="px-3 py-2.5 text-center !text-slate-500">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/event/tickets/${t.id}`}
                          className="block truncate text-[13px] font-semibold leading-[1.35] text-slate-800 no-underline transition-colors hover:text-emerald-700 hover:underline"
                        >
                          {t.subject}
                        </Link>
                        <span className="mt-[0.15rem] flex items-center gap-1 text-[0.7rem] !text-slate-400">
                          <MessageSquare className="h-3 w-3 shrink-0" aria-hidden />
                          {t.messageCount}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-center !text-slate-600">
                        {t.updatedLabel}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <TicketStatusBadge
                          status={t.status}
                          label={tk.statuses[status]}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {busy ? (
                            <Loader2
                              className="h-4 w-4 animate-spin text-slate-400"
                              aria-hidden
                            />
                          ) : null}
                          {canResolve ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  t.id,
                                  TICKET_STATUS.RESOLVED,
                                  tk.actions.toastResolved
                                )
                              }
                              disabled={busy}
                              className="whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[0.74rem] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {tk.actions.resolve}
                            </button>
                          ) : null}
                          {canClose ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  t.id,
                                  TICKET_STATUS.CLOSED,
                                  tk.reply.toastClosed
                                )
                              }
                              disabled={busy}
                              className="whitespace-nowrap rounded-md border border-red-300 bg-red-200 px-2.5 py-1.5 text-[0.74rem] font-semibold !text-slate-900 transition-colors hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {tk.actions.close}
                            </button>
                          ) : null}
                          {!canResolve && !canClose && !busy ? (
                            <span className="!text-slate-400">—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
