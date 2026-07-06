export type PortalTimelineStatus = "completed" | "upcoming" | "scheduled";

export type PortalTimelineEvent = {
  id: string;
  date: Date;
  title: string;
  description: string;
  status: PortalTimelineStatus;
};

const STATUS_LABEL: Record<PortalTimelineStatus, string> = {
  completed: "Completed",
  upcoming: "Upcoming",
  scheduled: "Scheduled",
};

/** Day + short-month, UTC-fixed so SSR and client hydration agree. */
function dayMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Vertical journey timeline (participant portal) matching the mockup:
 * date · status dot on a connecting line · title + status pill + description.
 */
export function PortalTimeline({ events }: { events: PortalTimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="portal-muted text-sm">No timeline events have been set yet.</p>
    );
  }

  return (
    <ol className="portal-timeline">
      {events.map((e) => (
        <li
          key={e.id}
          className={`portal-timeline__item portal-timeline__item--${e.status}`}
        >
          <div className="portal-timeline__date">
            <span className="portal-timeline__day">{dayMonth(e.date)}</span>
            <span className="portal-timeline__year">{e.date.getUTCFullYear()}</span>
          </div>
          <span className="portal-timeline__marker" aria-hidden />
          <div className="portal-timeline__body">
            <div className="portal-timeline__head">
              <span className="portal-timeline__title">{e.title}</span>
              <span
                className={`portal-timeline__pill portal-timeline__pill--${e.status}`}
              >
                {STATUS_LABEL[e.status]}
              </span>
            </div>
            <p className="portal-timeline__desc">{e.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
