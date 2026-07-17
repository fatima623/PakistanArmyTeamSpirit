// English — source of truth for the public Events Detail page (/events-detail).
// Other locales mirror this shape exactly (enforced via `typeof`).
//
// Only the page's own chrome lives here. The event rows themselves are
// admin-entered in the DB: their fixed-vocabulary fields (category, difficulty,
// duration, breakdown labels) are localized by `@/lib/i18n/event-content-i18n`,
// while the free-text fields (title, summary, details, participants) render as
// entered — see that module's header for the rationale.

export const events = {
  meta: {
    title: "Events Detail",
    description:
      "Every scored serial of the Pakistan Army Team Spirit exercise — marks, difficulty and the full brief behind each competition event.",
  },

  hero: {
    badge: "Competition catalogue",
    // Rendered as `titleLead <span>titleAccent</span>` — keep both halves short.
    titleLead: "Events",
    titleAccent: "Detail",
    lede:
      "Every scored serial of the exercise — navigation, reconnaissance, combat, medical and command tasks — with marks, difficulty and the full brief behind each card.",
  },

  filters: {
    searchPlaceholder: "Search events…",
    searchAria: "Search competition events",
    // Chip that clears both the category and the difficulty filter.
    all: "All",
  },

  /** Result-count line, e.g. "27 scored serials · 1900 total marks". */
  summary: (serials: number, marks: number) =>
    `${serials} scored ${serials === 1 ? "serial" : "serials"} · ${marks} total ${
      marks === 1 ? "mark" : "marks"
    }`,

  card: {
    /**
     * Unit under the marks value on each card — agrees with the number.
     * The explicit `string` return keeps the Dictionary type open: without it
     * TS infers the literal union `"Mark" | "Marks"` and every other locale
     * fails to satisfy it.
     */
    marksUnit: (marks: number): string => (marks === 1 ? "Mark" : "Marks"),
    /** `title` is admin-entered and stays in the language it was written in. */
    thumbAlt: (title: string) => `Photograph of the ${title} event`,
    viewDetails: "View Details",
  },

  empty: "No events match the current filters.",

  modal: {
    participants: "Participants",
    breakdown: "Marks breakdown",
    total: "Total marks for this event",
  },
};
