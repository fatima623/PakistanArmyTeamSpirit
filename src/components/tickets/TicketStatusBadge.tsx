import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  normalizeTicketStatus,
  type TicketPriority,
} from "@/lib/constants";

const STATUS_STYLE: Record<string, { bg: string; fg: string; border: string }> =
  {
    OPEN: { bg: "#fffbeb", fg: "#b45309", border: "#fde68a" },
    IN_PROGRESS: { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe" },
    RESOLVED: { bg: "#f0fdf4", fg: "#15803d", border: "#bbf7d0" },
    CLOSED: { bg: "#f1f5f9", fg: "#475569", border: "#e2e8f0" },
  };

export function TicketStatusBadge({ status }: { status: string }) {
  const key = normalizeTicketStatus(status);
  const s = STATUS_STYLE[key] ?? STATUS_STYLE.CLOSED;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.15rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        lineHeight: 1.6,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {TICKET_STATUS_LABELS[key]}
    </span>
  );
}

const PRIORITY_COLOR: Record<TicketPriority, string> = {
  LOW: "#64748b",
  NORMAL: "#475569",
  HIGH: "#dc2626",
};

export function TicketPriorityTag({ priority }: { priority: string }) {
  const key = (priority as TicketPriority) in TICKET_PRIORITY_LABELS
    ? (priority as TicketPriority)
    : "NORMAL";
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        color: PRIORITY_COLOR[key],
      }}
    >
      {TICKET_PRIORITY_LABELS[key]} priority
    </span>
  );
}
