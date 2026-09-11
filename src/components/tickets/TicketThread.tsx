"use client";

import { Fragment } from "react";
import { CheckCheck, Reply } from "lucide-react";

import { isStaffAuthorRole, ticketAuthorRoleLabel } from "@/lib/ticket-roles";
import { cn } from "@/lib/utils";

export type TicketThreadMessage = {
  id: string;
  authorRole: string;
  authorName: string;
  body: string;
  createdAt: Date | string;
  /** The message this one answers, when it was sent as a quote reply. */
  replyTo?: { id: string; authorName: string; body: string } | null;
};

/**
 * Group-chat conversation view, shared by the participant and support-desk
 * ticket pages.
 *
 * A ticket is a group thread: the participant who raised it plus every desk
 * role (Admin, MT, SD, Host Formation). Desk replies sit on the right in a
 * green bubble, the participant's on the left in a white one, and every bubble
 * names its author and — for the desk — which desk they answered from, because
 * more than one of them may be in the same conversation. Any message can be
 * quoted with `onReply`; the quote is rendered above the reply's own text.
 * Messages are grouped under a centered date separator whenever the day
 * changes — like WhatsApp/SMS.
 */
export function TicketThread({
  messages,
  staffLabel = "PATS team",
  locale,
  onReply,
  replyLabel = "Reply",
}: {
  messages: TicketThreadMessage[];
  /** Fallback label for desk replies whose stored role is unrecognised. */
  staffLabel?: string;
  /** BCP-47 locale for date/time formatting (defaults to the runtime locale). */
  locale?: string;
  /** Supplied by the conversation shell — quotes this message in the composer. */
  onReply?: (message: TicketThreadMessage) => void;
  replyLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {messages.map((m, i) => {
        const staff = isStaffAuthorRole(m.authorRole);
        const roleLabel = ticketAuthorRoleLabel(m.authorRole, staffLabel);
        const date = new Date(m.createdAt);
        const prev = i > 0 ? new Date(messages[i - 1].createdAt) : null;
        const newDay = !prev || prev.toDateString() !== date.toDateString();
        const time = date.toLocaleTimeString(locale, {
          hour: "numeric",
          minute: "2-digit",
        });

        return (
          <Fragment key={m.id}>
            {newDay ? (
              <div className="my-1.5 flex justify-center">
                <span className="rounded-full bg-black/[0.06] px-3 py-1 text-[0.72rem] font-medium text-slate-500">
                  {date.toLocaleDateString(locale, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ) : null}

            <div
              className={cn(
                "group/msg flex items-center gap-1.5",
                staff ? "justify-end" : "justify-start"
              )}
            >
              {/* The quote button sits outside the bubble, on the side the
                  bubble is NOT anchored to, so it never covers the text. */}
              {onReply && staff ? (
                <button
                  type="button"
                  onClick={() => onReply(m)}
                  aria-label={replyLabel}
                  title={replyLabel}
                  className="order-first shrink-0 rounded-full p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-black/[0.04] hover:text-slate-600 focus-visible:opacity-100 group-hover/msg:opacity-100"
                >
                  <Reply className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 shadow-[0_1px_1px_rgba(15,23,42,0.06)]",
                  staff
                    ? "rounded-br-sm bg-emerald-50"
                    : "rounded-bl-sm border border-slate-200 bg-white"
                )}
              >
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-[0.78rem] font-bold text-green-800">
                    {m.authorName}
                  </span>
                  {roleLabel ? (
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.05em] text-green-700/70">
                      {roleLabel}
                    </span>
                  ) : null}
                </div>

                {m.replyTo ? (
                  <div className="mb-1.5 border-s-[3px] border-emerald-400/70 bg-black/[0.035] px-2 py-1">
                    <span className="block text-[0.7rem] font-semibold text-green-800">
                      {m.replyTo.authorName}
                    </span>
                    <span className="line-clamp-2 block text-[0.75rem] leading-[1.35] text-slate-500">
                      {m.replyTo.body}
                    </span>
                  </div>
                ) : null}

                <p className="whitespace-pre-wrap text-[0.9rem] leading-[1.45] text-slate-800">
                  {m.body}
                </p>
                <div
                  className={cn(
                    "mt-1 flex items-center gap-1",
                    staff ? "justify-end" : "justify-start"
                  )}
                >
                  <span className="text-[0.66rem] text-slate-400">{time}</span>
                  {staff ? (
                    <CheckCheck className="h-3 w-3 text-sky-500" aria-hidden />
                  ) : null}
                </div>
              </div>

              {onReply && !staff ? (
                <button
                  type="button"
                  onClick={() => onReply(m)}
                  aria-label={replyLabel}
                  title={replyLabel}
                  className="shrink-0 rounded-full p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-black/[0.04] hover:text-slate-600 focus-visible:opacity-100 group-hover/msg:opacity-100"
                >
                  <Reply className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
