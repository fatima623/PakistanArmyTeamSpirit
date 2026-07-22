"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/constants";
import { TOAST } from "@/lib/toast";

const STATUSES = Object.entries(TICKET_STATUS_LABELS);
const PRIORITIES = Object.entries(TICKET_PRIORITY_LABELS);

/** Reply composer — the main action in the conversation column. */
export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setBody("");
        toast.success("Reply sent");
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

  return (
    <form onSubmit={handleReply} className="admin-ticket-reply">
      <div className="flex items-end gap-2 rounded-2xl border border-brand-line/70 bg-white px-4 py-2 shadow-[0_1px_2px_rgba(20,30,24,0.04)] transition-colors focus-within:border-green-600/60">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={1}
          placeholder="Type your reply…"
          maxLength={5000}
          className="ticket-reply-field min-h-[2.4rem] flex-1 resize-none self-center overflow-y-auto border-0 bg-transparent px-0 py-1.5 text-[0.9rem] shadow-none focus-visible:ring-0 md:text-[0.9rem]"
        />
        <Button
          type="submit"
          variant="adminPrimary"
          size="sm"
          disabled={sending || !body.trim()}
          className="shrink-0"
        >
          {sending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-4 w-4" aria-hidden />
          )}
          Send reply
        </Button>
      </div>
    </form>
  );
}

/** Status / priority / assignment controls — the ticket "Manage" sidebar. */
export function TicketManagePanel({
  ticketId,
  status,
  priority,
  assignedToId,
  currentAdminId,
}: {
  ticketId: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  currentAdminId: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const patch = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json();
      toast.error(data.error ?? TOAST.GENERIC_ERROR);
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const assignedToMe = assignedToId === currentAdminId;

  return (
    <div className="admin-ticket-manage">
      <label className="block">
        <span className="admin-label mb-1 block">Status</span>
        <Select
          value={status}
          onValueChange={(v) => patch({ status: v })}
          disabled={saving}
        >
          <SelectTrigger className="admin-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="block">
        <span className="admin-label mb-1 block">Priority</span>
        <Select
          value={priority}
          onValueChange={(v) => patch({ priority: v })}
          disabled={saving}
        >
          <SelectTrigger className="admin-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <div className="admin-ticket-assign">
        <span className="admin-label">Assignment</span>
        {assignedToMe ? (
          <Button
            variant="adminOutline"
            size="sm"
            onClick={() => patch({ assignedToId: null })}
            disabled={saving}
          >
            Unassign me
          </Button>
        ) : (
          <Button
            variant="adminOutline"
            size="sm"
            onClick={() => patch({ assignedToId: currentAdminId })}
            disabled={saving}
          >
            Assign to me
          </Button>
        )}
      </div>
    </div>
  );
}
