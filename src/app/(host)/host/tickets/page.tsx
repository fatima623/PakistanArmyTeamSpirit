import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireHostSession } from "@/lib/require-host";
import { formatDateShort } from "@/lib/utils";
import { TICKET_CATEGORY_LABELS, type TicketCategory } from "@/lib/constants";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import {
  adminDataTable,
  adminDataTableShell,
  adminTableActionsCenter,
  adminTableEmpty,
  adminTableHead,
  portalTableActionView,
} from "@/lib/admin-ui";

export const metadata: Metadata = {
  title: "Queries",
};

/**
 * The Host Formation's view of the support queue.
 *
 * Hosts are deliberately locked out of /admin, but the support desk is shared:
 * every query a participant raises is visible here too, and a host can answer
 * into the same thread the admins are reading.
 */
export default async function HostTicketsPage() {
  await requireHostSession();

  const tickets = await prisma.supportTicket.findMany({
    orderBy: [{ lastReplyAt: "desc" }],
    take: 100,
    select: {
      id: true,
      subject: true,
      category: true,
      status: true,
      lastReplyAt: true,
      user: { select: { firstName: true, lastName: true, country: true } },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="admin-page-title m-0">Participant queries</h1>
        <p className="m-0 mt-1 text-[0.8125rem] text-slate-500">
          Every query raised by a participant, shared with the administration.
          Open one to read the conversation and reply.
        </p>
      </header>

      <div className={adminDataTableShell}>
        <table className={adminDataTable}>
          <thead className={adminTableHead}>
            <tr>
              <th scope="col">Subject</th>
              <th scope="col">Category</th>
              <th scope="col">Raised by</th>
              <th scope="col">Messages</th>
              <th scope="col">Updated</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className={adminTableEmpty}>
                  <LifeBuoy
                    className="mx-auto mb-2 h-6 w-6 opacity-50"
                    aria-hidden
                  />
                  No queries have been raised yet.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id}>
                  <td className="font-semibold text-slate-900">{t.subject}</td>
                  <td>
                    {TICKET_CATEGORY_LABELS[t.category as TicketCategory] ??
                      t.category}
                  </td>
                  <td>{`${t.user.firstName} ${t.user.lastName}`.trim()}</td>
                  <td className="tabular-nums">{t._count.messages}</td>
                  <td>{formatDateShort(t.lastReplyAt)}</td>
                  <td>
                    <TicketStatusBadge status={t.status} />
                  </td>
                  <td className={adminTableActionsCenter}>
                    <Link
                      href={`/host/tickets/${t.id}`}
                      className={portalTableActionView}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
