import type { Metadata } from "next";

import { requireHostSession } from "@/lib/require-host";
import { DeskTicketDetail } from "@/components/tickets/DeskTicketDetail";

export const metadata: Metadata = {
  title: "Query",
};

type PageProps = { params: Promise<{ id: string }> };

/**
 * The Host Formation's view of a ticket — the same shared conversation the
 * admin console renders, so a reply posted here reaches the participant and
 * the rest of the desk alike.
 */
export default async function HostTicketDetailPage({ params }: PageProps) {
  await requireHostSession();
  const { id } = await params;

  return (
    <DeskTicketDetail
      ticketId={id}
      backHref="/host/tickets"
      backLabel="Back to queries"
    />
  );
}
