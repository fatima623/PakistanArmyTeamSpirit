import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { TICKET_STATUS } from "@/lib/constants";
import { roleLabel } from "@/lib/auth-routes";
import { TicketConversation } from "@/components/tickets/TicketConversation";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";

/**
 * One ticket, as the support desk sees it.
 *
 * Rendered identically by the admin console and the host portal: the desk is
 * shared, so both read the same thread and post to the same endpoint. The only
 * thing either route supplies is where its own "back" link goes.
 */
export async function DeskTicketDetail({
  ticketId,
  backHref,
  backLabel,
}: {
  ticketId: string;
  backHref: string;
  backLabel: string;
}) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      status: true,
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          authorRole: true,
          authorName: true,
          body: true,
          createdAt: true,
          replyTo: { select: { id: true, authorName: true, body: true } },
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const closed = ticket.status === TICKET_STATUS.CLOSED;
  const fullName = `${ticket.user.firstName} ${ticket.user.lastName}`.trim();
  const initials =
    `${ticket.user.firstName?.[0] ?? ""}${ticket.user.lastName?.[0] ?? ""}`
      .toUpperCase()
      .trim() || "?";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 self-start text-[0.78rem] font-medium text-muted-foreground no-underline transition-colors hover:text-green-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {backLabel}
      </Link>

      <section className="flex flex-col overflow-hidden rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        {/* Header — stays put while the conversation scrolls */}
        <header className="flex items-center gap-3 border-b border-brand-line/60 bg-white px-[1.1rem] py-[0.8rem]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-600 text-[0.9rem] font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="m-0 truncate text-[1.05rem] font-bold leading-[1.3] tracking-[-0.02em] text-brand-ink">
              {ticket.subject}
            </h1>
            <p className="m-0 truncate text-[0.8rem] text-muted-foreground">
              {fullName} · {roleLabel("user")}
            </p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </header>

        <TicketConversation
          ticketId={ticket.id}
          messages={ticket.messages}
          postUrl={`/api/support-desk/tickets/${ticket.id}/messages`}
          closed={closed}
          strings={{
            placeholder: "Type your reply…",
            send: "Send reply",
            reply: "Reply",
            replyingTo: "Replying to",
            cancelReply: "Cancel reply",
            closedNotice:
              "This ticket is closed. The participant must raise a new one to continue.",
            genericError: "Something went wrong. Please try again.",
          }}
        />
      </section>
    </div>
  );
}
