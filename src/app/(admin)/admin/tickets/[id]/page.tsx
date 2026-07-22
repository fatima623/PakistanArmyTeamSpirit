import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/cached-auth";
import { TicketThread } from "@/components/tickets/TicketThread";
import { TicketReplyForm } from "@/components/admin/AdminTicketControls";

export const metadata: Metadata = {
  title: "Support ticket",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminTicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  await getCachedSession();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: {
      id: true,
      subject: true,
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

  if (!ticket) {
    notFound();
  }

  const fullName = `${ticket.user.firstName} ${ticket.user.lastName}`.trim();
  const initials =
    `${ticket.user.firstName?.[0] ?? ""}${ticket.user.lastName?.[0] ?? ""}`
      .toUpperCase()
      .trim() || "?";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-1 self-start text-[0.78rem] font-medium text-muted-foreground no-underline transition-colors hover:text-green-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to tickets
      </Link>

      <section className="flex flex-col overflow-hidden rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
        {/* WhatsApp-style header — stays put while the conversation scrolls */}
        <header className="flex items-center gap-3 border-b border-brand-line/60 bg-white px-[1.1rem] py-[0.8rem]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-600 text-[0.9rem] font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="m-0 truncate text-[1.05rem] font-bold leading-[1.3] tracking-[-0.02em] text-brand-ink">
              {ticket.subject}
            </h1>
            <p className="m-0 truncate text-[0.8rem] text-muted-foreground">
              {fullName}
            </p>
          </div>
        </header>

        {/* Scrollable conversation */}
        <div className="max-h-[60vh] overflow-y-auto bg-[rgba(240,244,238,0.7)] px-[1.1rem] py-[0.9rem]">
          <TicketThread messages={ticket.messages} />
        </div>

        {/* Reply composer — stays put at the bottom */}
        <div className="border-t border-brand-line/60 bg-white px-[1.1rem] py-[0.85rem]">
          <TicketReplyForm ticketId={ticket.id} />
        </div>
      </section>
    </div>
  );
}
