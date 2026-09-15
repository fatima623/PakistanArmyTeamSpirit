import {
  TICKET_STATUS_LABELS,
  normalizeTicketStatus,
} from "@/lib/constants";

const STATUS_STYLE: Record<string, { bg: string; fg: string; border: string }> =
  {
    OPEN: { bg: "#fef3c7", fg: "#78350f", border: "#fcd34d" },
    IN_PROGRESS: { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe" },
    RESOLVED: { bg: "#f0fdf4", fg: "#15803d", border: "#bbf7d0" },
    CLOSED: { bg: "#f1f5f9", fg: "#475569", border: "#e2e8f0" },
  };

export function TicketStatusBadge({
  status,
  label,
}: {
  status: string;
  /** Optional translated label; falls back to the English constant. */
  label?: string;
}) {
  const key = normalizeTicketStatus(status);
  const s = STATUS_STYLE[key] ?? STATUS_STYLE.CLOSED;
  return (
    <span
      // The class name carries no styles of its own; it exists so the portal's
      // `:is(…span…){color:…!important}` sweep — which spares `[class*="badge"]`
      // — leaves this badge's inline status colour intact instead of repainting
      // its label slate-600.
      className="ticket-status-badge"
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
      {label ?? TICKET_STATUS_LABELS[key]}
    </span>
  );
}
