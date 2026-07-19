"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiErrorMessage } from "@/lib/i18n/api-error-i18n";
import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Reply + close controls for a participant's own ticket.
 * Closed tickets render a read-only notice instead.
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

  if (closed) {
    return (
      <p className="portal-muted mt-4 text-sm">{tk.reply.closedNotice}</p>
    );
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setBody("");
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
    <form onSubmit={handleReply} className="mt-5 space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder={tk.reply.placeholder}
        maxLength={5000}
      />
      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={closing || sending}
        >
          {closing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tk.reply.closeTicket}
        </Button>
        <Button
          type="submit"
          className="cp-btn-primary px-6"
          disabled={sending || !body.trim()}
        >
          {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tk.reply.sendReply}
        </Button>
      </div>
    </form>
  );
}
