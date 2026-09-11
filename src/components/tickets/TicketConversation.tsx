"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

import {
  TicketThread,
  type TicketThreadMessage,
} from "@/components/tickets/TicketThread";

export type TicketConversationStrings = {
  placeholder: string;
  send: string;
  reply: string;
  replyingTo: string;
  cancelReply: string;
  closedNotice: string;
  closeTicket?: string;
  toastClosed?: string;
  genericError: string;
};

/**
 * The ticket conversation: the group thread plus its composer.
 *
 * One shell serves all three views (participant, admin console, host portal) so
 * the quote-reply state — which message the composer is answering — lives in a
 * single place. The only things that differ per view are the endpoint it posts
 * to, whether the "close ticket" action is offered, and the translated strings.
 *
 * `Enter` sends, `Shift+Enter` inserts a newline.
 */
export function TicketConversation({
  ticketId,
  messages,
  postUrl,
  closeUrl,
  closed = false,
  locale,
  staffLabel,
  strings,
}: {
  ticketId: string;
  messages: TicketThreadMessage[];
  /** Endpoint that accepts `{ body, replyToId }`. */
  postUrl: string;
  /** Participant view only — endpoint that closes the ticket. */
  closeUrl?: string;
  closed?: boolean;
  locale?: string;
  staffLabel?: string;
  strings: TicketConversationStrings;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<TicketThreadMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoSize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const startReply = (message: TicketThreadMessage) => {
    setReplyTo(message);
    textareaRef.current?.focus();
  };

  const sendReply = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, replyToId: replyTo?.id ?? null }),
      });
      if (res.ok) {
        setBody("");
        setReplyTo(null);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => null);
      toast.error(
        data?.error ?? data?.errors?.body?.[0] ?? strings.genericError
      );
    } catch {
      toast.error(strings.genericError);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!closeUrl) return;
    setClosing(true);
    try {
      const res = await fetch(closeUrl, { method: "POST" });
      if (res.ok) {
        if (strings.toastClosed) toast.success(strings.toastClosed);
        router.refresh();
        return;
      }
      toast.error(strings.genericError);
    } catch {
      toast.error(strings.genericError);
    } finally {
      setClosing(false);
    }
  };

  return (
    <>
      <div className="max-h-[60vh] overflow-y-auto bg-slate-50/70 px-3 py-4 sm:px-5">
        <TicketThread
          messages={messages}
          staffLabel={staffLabel}
          locale={locale}
          replyLabel={strings.reply}
          onReply={closed ? undefined : startReply}
        />
      </div>

      <div className="border-t border-brand-line bg-white px-3 py-3 sm:px-5">
        {closed ? (
          <p className="m-0 text-[0.85rem] text-slate-500">
            {strings.closedNotice}
          </p>
        ) : (
          <>
            {closeUrl ? (
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={closing || sending}
                  className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 hover:underline disabled:opacity-50"
                >
                  {closing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : null}
                  {strings.closeTicket}
                </button>
              </div>
            ) : null}

            {replyTo ? (
              <div className="mb-2 flex items-start gap-2 rounded-lg border-s-[3px] border-emerald-400 bg-emerald-50/70 px-2.5 py-1.5">
                <div className="min-w-0 flex-1">
                  <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-emerald-700">
                    {strings.replyingTo} {replyTo.authorName}
                  </span>
                  <span className="line-clamp-1 block text-[0.78rem] text-slate-600">
                    {replyTo.body}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  aria-label={strings.cancelReply}
                  title={strings.cancelReply}
                  className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-black/[0.05] hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendReply();
              }}
              className="flex items-end gap-2 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
            >
              <textarea
                ref={textareaRef}
                id={`ticket-reply-${ticketId}`}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  autoSize();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendReply();
                  }
                }}
                rows={1}
                placeholder={strings.placeholder}
                maxLength={5000}
                style={{ backgroundColor: "transparent" }}
                className="ticket-reply-field max-h-32 flex-1 resize-none self-center overflow-y-auto border-0 py-1 text-[0.9rem] leading-[1.4] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={sending || !body.trim()}
                aria-label={strings.send}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <Loader2
                    className="h-[1.05rem] w-[1.05rem] animate-spin"
                    aria-hidden
                  />
                ) : (
                  <Send className="h-[1.05rem] w-[1.05rem]" aria-hidden />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
