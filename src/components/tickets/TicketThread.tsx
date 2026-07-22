import { Fragment } from "react";
import { CheckCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export type TicketThreadMessage = {
  id: string;
  authorRole: string;
  authorName: string;
  body: string;
  createdAt: Date | string;
};

/**
 * Chat-style conversation view, shared by the participant and admin ticket
 * pages. Staff/support replies sit on the right in a green bubble; the
 * participant's messages sit on the left in a white bubble. Messages are grouped
 * under a centered date separator whenever the day changes — like WhatsApp/SMS.
 */
export function TicketThread({
  messages,
  staffLabel = "PATS team",
  locale,
}: {
  messages: TicketThreadMessage[];
  /** Optional translated label for staff replies. */
  staffLabel?: string;
  /** BCP-47 locale for date/time formatting (defaults to the runtime locale). */
  locale?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {messages.map((m, i) => {
        const staff = m.authorRole === "staff";
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

            <div className={cn("flex", staff ? "justify-end" : "justify-start")}>
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
                  {staff ? (
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.05em] text-green-700/70">
                      {staffLabel}
                    </span>
                  ) : null}
                </div>
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
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
