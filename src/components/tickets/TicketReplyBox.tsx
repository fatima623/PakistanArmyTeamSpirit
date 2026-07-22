"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/i18n/api-error-i18n";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Chat-style reply bar for a participant's own ticket: a rounded pill holding a
 * single-line auto-growing textarea and a green circular send button. Enter
 * sends, Shift+Enter inserts a newline. A secondary "Close ticket" link sits
 * above the bar. Closed tickets render a read-only notice instead.
 */
export function TicketReplyBox({
  ticketId,
  closed,
}: {
  ticketId: string;
  closed: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const tk = t.tickets;
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (closed) {
    return <p className="portal-muted text-[0.9rem]">{tk.reply.closedNotice}</p>;
  }

  const autoSize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const sendReply = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setBody("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        router.refresh();
        return;
      }
      const data = await res.json();
      toast.error(apiErrorMessage(data, locale, t.common.toasts.genericError));
    } catch {
      toast.error(t.common.toasts.genericError);
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendReply();
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/close`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success(tk.reply.toastClosed);
        router.refresh();
        return;
      }
      toast.error(t.common.toasts.genericError);
    } catch {
      toast.error(t.common.toasts.genericError);
    } finally {
      setClosing(false);
    }
  };

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={handleClose}
          disabled={closing || sending}
          className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 hover:underline disabled:opacity-50"
        >
          {closing && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          )}
          {tk.reply.closeTicket}
        </button>
      </div>

      <form
        onSubmit={handleReply}
        className="flex items-end gap-2 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      >
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            autoSize();
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={tk.reply.placeholder}
          maxLength={5000}
          style={{ backgroundColor: "transparent" }}
          className="ticket-reply-field max-h-32 flex-1 resize-none self-center overflow-y-auto border-0 py-1 text-[0.9rem] leading-[1.4] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          aria-label={tk.reply.sendReply}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? (
            <Loader2 className="h-[1.05rem] w-[1.05rem] animate-spin" aria-hidden />
          ) : (
            <Send className="h-[1.05rem] w-[1.05rem]" aria-hidden />
          )}
        </button>
      </form>
    </div>
  );
}
