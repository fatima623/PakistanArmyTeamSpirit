"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TOAST } from "@/lib/toast";

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
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  if (closed) {
    return (
      <p className="portal-muted mt-4 text-sm">
        This ticket is closed. Raise a new ticket if you need further help.
      </p>
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
      toast.error(data.error ?? data.errors?.body?.[0] ?? TOAST.GENERIC_ERROR);
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
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
        toast.success("Ticket closed");
        router.refresh();
        return;
      }
      toast.error(TOAST.GENERIC_ERROR);
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
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
        placeholder="Write a reply…"
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
          Close ticket
        </Button>
        <Button
          type="submit"
          className="cp-btn-primary px-6"
          disabled={sending || !body.trim()}
        >
          {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reply
        </Button>
      </div>
    </form>
  );
}
