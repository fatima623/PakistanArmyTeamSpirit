// English — source of truth for the public landing (home) page.
// Other locales mirror this shape exactly (enforced via `typeof`).

export const home = {
  hero: {
    featuredAria: "Featured highlights",
    // Headline is split on "(PATS)" in the hero; keep the two display lines.
    titleLine1: "Pakistan Army Team Spirit (PATS)",
    titleLine2: "Competition",
    description:
      "International Pakistan Army Team Spirit — a 60-hour patrolling exercise testing tactical mastery, endurance, and team spirit among partner nations.",
    cta: "Register your team",
    scrollHint: "Scroll down",
  },

  // Zipped with the numeric values from ARMY_STATS (same order).
  stats: [
    { suffix: " HRS", label: "Patrol exercise duration" },
    { suffix: "", label: "Stations" },
    { suffix: "+", label: "Tactical tests" },
    { suffix: "", label: "Scored tasks" },
  ],

  mission: {
    eyebrow: "Concept / Purpose",
    quote: "PERSEVERANCE ACCLAIMED THROUGH TEAM SPIRIT",
    body:
      "Pakistan Army Team Spirit (PATS) is a mission- and task-oriented patrolling competition organized annually under JLA — PATS. The main aim is a demanding patrolling exercise to assess and enhance tactical and mental abilities — participants must be prepared mentally and physically. Teams must achieve proficiency in minor operations, endurance, and prowess in basic drills and procedures.",
  },

  careers: {
    eyebrow: "Participation",
    title: "Start your PATS journey",
    description:
      "Register your patrol through this portal with accurate roster and liaison details. Track notices, key dates, and payment steps in your participant dashboard.",
    // Keyed by CAREER_TRACKS id — images and links stay in code.
    cards: {
      register: { tag: "Participation", title: "Register your team" },
      operations: { tag: "Scored events", title: "Operations brief" },
      international: { tag: "Partner nations", title: "International editions" },
    },
  },

  about: {
    eyebrow: "About PATS",
    title: "Competition overview",
    lead:
      "Pakistan Army Team Spirit (PATS) is a mission- and task-oriented patrolling competition organized annually under JLA — PATS. Perseverance acclaimed through Team Spirit.",
    imageAlt: "PATS competition overview",
    points: [
      {
        title: "60-hour operational exercise",
        body: "A reconnaissance patrol infiltrates terrorist-dominated terrain across 30×30 km, traversing 50–60 km through 20–22 tactical scenarios with no scheduled rest.",
      },
      {
        title: "International since 2016",
        body: "Ninth international editions have brought partner nations together for realistic patrolling, orientation, and shared competition standards.",
      },
      {
        title: "Scored battlefield events",
        body: "Tests reflect sub-conventional operations — navigation, CTR, CBRN, assault, medical, fires, and endurance under a combined marks scheme.",
      },
    ],
  },

  dates: {
    eyebrow: "Key dates",
    title: "Schedule",
    fullSchedule: "Full schedule",
  },
};
