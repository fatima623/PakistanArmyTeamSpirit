import { formatDateDisplay } from "@/lib/utils";

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
    return <p className="admin-timeline-empty">No activity recorded yet.</p>;
  }

  return (
    <ul className="admin-timeline">
      {logs.map((log) => (
        <li key={log.id} className="admin-timeline-item">
          <span className="admin-timeline-dot" aria-hidden />
          <div className="admin-timeline-body">
            <p className="admin-timeline-action">
              {log.action.replace(/_/g, " ")}
            </p>
            <p className="admin-timeline-meta">
              {formatDateDisplay(log.createdAt)}
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
