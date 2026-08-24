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
      "International Pakistan Army Team Spirit a 60-hour patrolling exercise testing tactical mastery, endurance, and team spirit .",
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
      "Pakistan Army Team Spirit (PATS) is a mission- and task-oriented exercise organized anually under the supervision of Pakistan Army. The exercise is manifested by its highest standard of physical fitness, robustness, tactical expertise and soldierly attributes.",
  },

 



  dates: {
    eyebrow: "Key dates",
    title: "Schedule",
  },
};
