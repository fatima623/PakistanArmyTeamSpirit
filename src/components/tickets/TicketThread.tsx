import { formatDateTime } from "@/lib/utils";

export type TicketThreadMessage = {
  id: string;
  authorRole: string;
  authorName: string;
  body: string;
  createdAt: Date | string;
};

/** Read-only conversation view, shared by the participant and admin ticket pages. */
export function TicketThread({
  messages,
}: {
  messages: TicketThreadMessage[];
}) {
  return (
    <ul className="space-y-4">
      {messages.map((m) => {
        const staff = m.authorRole === "staff";
        return (
          <li
            key={m.id}
            className="rounded-lg border p-4"
            style={{
              background: staff ? "#f0f9ff" : "#f8fafc",
              borderColor: staff ? "#bae6fd" : "#e2e8f0",
            }}
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-cp-ink">
                {m.authorName}
                {staff ? (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#0369a1",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    PATS team
                  </span>
                ) : null}
              </span>
              <span className="portal-muted text-xs" style={{ color: "#64748b" }}>
                {formatDateTime(m.createdAt)}
              </span>
            </div>
            <p
              className="whitespace-pre-wrap text-sm text-cp-ink"
              style={{ color: "#1e293b" }}
            >
              {m.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
