// English — source of truth for the public landing (home) page.
// Other locales mirror this shape exactly (enforced via `typeof`).

import { HERO_MOTTO } from "@/lib/branding";

export const home = {
  hero: {
    featuredAria: "Featured highlights",
    // Headline is split on "(PATS)" in the hero; keep the two display lines.
    titleLine1: "Pakistan Army Team Spirit (PATS)",
    titleLine2: "Competition",
    /**
     * The crest motto (Iqbal): "Faith unwavering, action relentless, love
     * conquering all". English keeps the original Urdu heraldic form — the
     * hero renders it lang="ur" dir="rtl" in nastaliq. Every other locale
     * carries a real translation of its meaning, set in that locale's own
     * script/direction (see PatsHero).
     */
    motto: HERO_MOTTO,
    description:
      "International Pakistan Army Team Spirit a 60-hour patrolling exercise testing tactical mastery, endurance, and team spirit among partner nations.",
    // cta: "Register your team",
    scrollHint: "Scroll down",
  },

  // Zipped with the numeric values from ARMY_STATS (same order).
  stats: [
    { suffix: " HRS", label: "Patrol exercise duration" },
    { suffix: "", label: "Stations" },
    { suffix: "+", label: "Tactical tests" },
    { suffix: "", label: "Events" },
  ],

  mission: {
    eyebrow: "Concept / Purpose",
    imageAlt: "PATS international competition marks",
    quote: "PERSEVERANCE ACCLAIMED THROUGH TEAM SPIRIT",
    body:
      "Pakistan Army Team Spirit (PATS) is a mission- and task-oriented patrolling competition organized annually under JLA PATS. The main aim is a demanding patrolling exercise to assess and enhance tactical and mental abilities — participants must be prepared mentally and physically. Teams must achieve proficiency in minor operations, endurance, and prowess in basic drills and procedures.",
  },

 



  dates: {
    eyebrow: "Key dates",
    title: "Schedule",
    fullSchedule: "Full schedule",
  },
};
