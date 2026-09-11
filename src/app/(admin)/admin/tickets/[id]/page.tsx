import type { Metadata } from "next";

import { DeskTicketDetail } from "@/components/tickets/DeskTicketDetail";

export const metadata: Metadata = {
  title: "Support ticket",
};

type PageProps = { params: Promise<{ id: string }> };

/**
 * The admin console's view of a ticket. The desk is shared with MT, SD and the
 * Host Formation login, so the conversation itself is the one shared component
 * — only the "back" link differs between the consoles.
 */
export default async function AdminTicketDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <DeskTicketDetail
      ticketId={id}
      backHref="/admin/tickets"
      backLabel="Back to tickets"
    />
  );
}
