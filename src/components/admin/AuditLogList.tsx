"use client";

import { useState } from "react";

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

function prettyMetadata(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function AuditItem({ log }: { log: AuditEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="admin-user-detail-audit-item rounded-lg border border-cp-border/80 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="admin-user-detail-audit-action font-medium text-cp-ink">
            {log.action.replace(/_/g, " ")}
          </p>
          <p className="admin-user-detail-audit-meta text-xs text-cp-ink-muted">
            {formatDateDisplay(log.createdAt)}
            {log.actor
              ? ` — ${log.actor.firstName} ${log.actor.lastName}`
              : " — System"}
          </p>
        </div>
        {log.metadata ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="admin-link shrink-0 text-xs font-medium"
            aria-expanded={open}
          >
            {open ? "Hide" : "View"}
          </button>
        ) : null}
      </div>
      {open && log.metadata ? (
        <pre className="mt-2 overflow-x-auto rounded-md bg-cp-parchment/60 px-2 py-1.5 text-[11px] leading-relaxed text-cp-ink">
          {prettyMetadata(log.metadata)}
        </pre>
      ) : null}
    </li>
  );
}

export function AuditLogList({ logs }: { logs: AuditEntry[] }) {
  if (logs.length === 0) {
    return (
      <p className="admin-user-detail-empty text-sm admin-muted">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <ul className="admin-user-detail-audit-list max-h-96 space-y-3 overflow-y-auto text-sm">
      {logs.map((log) => (
        <AuditItem key={log.id} log={log} />
      ))}
    </ul>
  );
}
