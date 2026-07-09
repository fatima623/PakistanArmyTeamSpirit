import Link from "next/link";

import { formatDateDisplay, formatDateTime } from "@/lib/utils";
import type { TimelineData } from "@/lib/timeline";

function DeadlinePill({ passed, days }: { passed: boolean; days: number }) {
  const urgent = !passed && days <= 7;
  const style = passed
    ? { bg: "#f1f5f9", fg: "#475569", border: "#e2e8f0" }
    : urgent
      ? { bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca" }
      : { bg: "#f0fdf4", fg: "#15803d", border: "#bbf7d0" };
  const text = passed
    ? "Closed"
    : days <= 0
      ? "Due today"
      : `${days} day${days === 1 ? "" : "s"} left`;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.15rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.72rem",
        fontWeight: 700,
        background: style.bg,
        color: style.fg,
        border: `1px solid ${style.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

/**
 * Event timeline — enforced deadlines (with live status) plus informational
 * key dates. `compact` renders the dashboard summary (deadlines only).
 */
export function Timeline({
  data,
  compact = false,
}: {
  data: TimelineData;
  compact?: boolean;
}) {
  const { deadlines, keyDates } = data;

  return (
    <div className="space-y-5">
      {deadlines.length > 0 ? (
        <div>
          <h3 className="portal-section-title mb-3 text-sm">Deadlines</h3>
          <ul className="space-y-2">
            {deadlines.map((d) => (
              <li
                key={d.key}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
                style={{ borderColor: "#e2e8f0", background: "#ffffff" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-ink">{d.label}</p>
                  <p className="portal-muted text-xs" style={{ color: "#64748b" }}>
                    {formatDateTime(d.date)}
                  </p>
                </div>
                <DeadlinePill passed={d.passed} days={d.daysRemaining} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !compact && (
          <p className="portal-muted text-sm">No deadlines have been set yet.</p>
        )
      )}

      {!compact && (
        <div>
          <h3 className="portal-section-title mb-3 text-sm">Key dates</h3>
          {keyDates.length === 0 ? (
            <p className="portal-muted text-sm">No key dates published yet.</p>
          ) : (
            <ul className="space-y-2">
              {keyDates.map((k) => (
                <li
                  key={k.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  style={{ borderColor: "#e2e8f0", background: "#ffffff" }}
                >
                  <span className="text-sm font-semibold text-brand-ink">
                    {k.label}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: "#475569", textAlign: "right" }}
                  >
                    {k.date ? formatDateDisplay(k.date) : k.value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {compact && (
        <Link href="/event/timeline" className="portal-link text-sm">
          View full timeline →
        </Link>
      )}
    </div>
  );
}
