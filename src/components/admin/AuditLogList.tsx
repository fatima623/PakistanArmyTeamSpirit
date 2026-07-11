import { formatDateTimePK } from "@/lib/utils";

type AuditEntry = {
  id: string;
  action: string;
  metadata: string | null;
  createdAt: Date | string;
  actor: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

/**
 * Compact activity timeline — one line per event (action · when · who).
 * Read-only; no expandable metadata.
 */
export function AuditLogList({ logs }: { logs: AuditEntry[] }) {
  if (logs.length === 0) {
    return <p className="m-0 text-[12.5px] text-muted-foreground">No activity recorded yet.</p>;
  }

  return (
    <ul className="admin-timeline m-0 max-h-[440px] list-none overflow-y-auto p-0">
      {logs.map((log) => (
        <li key={log.id} className="relative flex gap-2.5 py-[7px] [&:not(:last-child)]:before:absolute [&:not(:last-child)]:before:-bottom-px [&:not(:last-child)]:before:left-1 [&:not(:last-child)]:before:top-[17px] [&:not(:last-child)]:before:w-px [&:not(:last-child)]:before:bg-brand-line/60 [&:not(:last-child)]:before:content-['']">
          <span className="mt-[5px] h-[9px] w-[9px] flex-none rounded-full bg-green-800 ring-[3px] ring-green-800/10" aria-hidden />
          <div className="min-w-0">
            <p className="m-0 text-xs font-semibold capitalize leading-[1.3] text-brand-ink">
              {log.action.replace(/_/g, " ")}
            </p>
            <p className="mt-px text-[11px] text-muted-foreground">
              <time dateTime={new Date(log.createdAt).toISOString()}>
                {formatDateTimePK(log.createdAt)}
              </time>
              {log.actor
                ? ` · ${log.actor.firstName} ${log.actor.lastName}`
                : " · System"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
