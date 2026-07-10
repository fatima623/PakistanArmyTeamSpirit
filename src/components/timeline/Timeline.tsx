import { cn, formatDateDisplay, formatDateTime } from "@/lib/utils";
import type { TimelineData } from "@/lib/timeline";

function DeadlinePill({ passed, days }: { passed: boolean; days: number }) {
  const urgent = !passed && days <= 7;
  const tone = passed
    ? "border-slate-200 bg-slate-100 text-slate-600"
    : urgent
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const text = passed
    ? "Closed"
    : days <= 0
      ? "Due today"
      : `${days} day${days === 1 ? "" : "s"} left`;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.72rem] font-bold",
        tone
      )}
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
            {deadlines.map((d) => {
              const urgent = !d.passed && d.daysRemaining <= 7;
              const accent = d.passed
                ? "border-l-slate-300"
                : urgent
                  ? "border-l-red-400"
                  : "border-l-emerald-400";
              return (
                <li
                  key={d.key}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border border-l-[3px] border-slate-200 bg-white p-3 transition-colors hover:border-slate-300",
                    accent
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-ink">
                      {d.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(d.date)}
                    </p>
                  </div>
                  <DeadlinePill passed={d.passed} days={d.daysRemaining} />
                </li>
              );
            })}
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
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <span className="text-sm font-semibold text-brand-ink">
                    {k.label}
                  </span>
                  <span className="text-right text-sm text-slate-600">
                    {k.date ? formatDateDisplay(k.date) : k.value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
