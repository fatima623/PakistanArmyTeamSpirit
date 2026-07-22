import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireConfirmedParticipant } from "@/lib/require-participant";
import { TICKET_STATUS } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { TicketThread } from "@/components/tickets/TicketThread";
import { TicketReplyBox } from "@/components/tickets/TicketReplyBox";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.supportTicket };
}

type PageProps = { params: Promise<{ id: string }> };

export default async function ParticipantTicketDetailPage({
  params,
}: PageProps) {
  const session = await requireConfirmedParticipant();
  const { id } = await params;
  const { t: dict, locale } = await getDictionary();
  const tk = dict.tickets;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      subject: true,
      status: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          authorRole: true,
          authorName: true,
          body: true,
          createdAt: true,
        },
      },
    },
  });

  if (!ticket || ticket.userId !== session.user.id) {
    notFound();
  }

  const closed = ticket.status === TICKET_STATUS.CLOSED;
  const fullName = `${ticket.user.firstName} ${ticket.user.lastName}`.trim();
  const initials =
    `${ticket.user.firstName?.[0] ?? ""}${ticket.user.lastName?.[0] ?? ""}`
      .toUpperCase()
      .trim() || "?";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <Link href="/event/tickets" className="portal-back-link mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {tk.detail.backToSupport}
      </Link>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-white shadow-sm">
        {/* WhatsApp-style header — stays put while the conversation scrolls */}
        <header className="flex items-center gap-3 border-b border-brand-line bg-white px-4 py-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[0.95rem] font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="m-0 truncate text-[1.05rem] font-bold leading-[1.3] tracking-[-0.02em] text-slate-900">
              {ticket.subject}
            </h1>
            <p className="m-0 truncate text-[0.82rem] text-slate-500">
              {fullName}
            </p>
          </div>
        </header>

        {/* Scrollable conversation */}
        <div className="max-h-[60vh] overflow-y-auto bg-slate-50/70 px-3 py-4 sm:px-5">
          <TicketThread
            messages={ticket.messages}
            staffLabel={tk.staffTag}
            locale={locale}
          />
        </div>

        {/* Reply composer — stays put at the bottom */}
        <div className="border-t border-brand-line bg-white px-3 py-3 sm:px-5">
          <TicketReplyBox ticketId={ticket.id} closed={closed} />
        </div>
      </div>
    </div>
  );
}
