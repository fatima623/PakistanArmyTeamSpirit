/** Public marketing copy — official PATS booklet only. */

import { PATS_ESSENCE, PATS_MOTTO, OVERVIEW } from "@/lib/pats-content";

export const ABOUT_PATS = {
  lead: `${OVERVIEW.lead} ${PATS_ESSENCE}.`,
  motto: PATS_MOTTO,
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
} as const;

export const PARTICIPATION_INFO = [
  {
    title: "Team composition",
    body: "Eight-man patrol plus reserves and team manager — captain-led with defined LMG, signal, and rifleman roles per official table of organization.",
  },
  {
    title: "Load discipline",
    body: "200 kg total team weight including weapons, ammunition, Harris set with spare batteries, filled water bottles, and issued tracker.",
  },
  {
    title: "International teams",
    body: "Orientation covers firing, navigation, signals, CBRN, AFOS/ATGP, and area familiarization before the exercise begins.",
  },
] as const;

export const INTERNATIONAL_TEAMS = {
  description:
    "International PATS brings friendly armed forces together for a professionally run patrolling exercise — shared standards for training, protocol, and on-ground coordination.",
  highlights: [
    "Participation from partner nations across Asia, Africa, Europe, and the Middle East",
    "Edition history from 2017 through 2025 with expanding flag representation",
    "Pre-exercise familiarization on competition weapons and events",
    "Hosted by Junior Leaders Academy (JLA) — PATS",
  ],
} as const;

export const REGISTRATION_INFO = {
  description:
    "Register your patrol through this portal with accurate roster and liaison details. Track notices, key dates, and payment steps in your participant dashboard.",
  steps: [
    "Create team account and submit registration with complete roster",
    "Upload required supporting documents",
    "Monitor acceptance status and competition notices",
    "Complete payment when directed; prepare per official kit list",
  ],
} as const;

export const FOOTER_LINKS = [
  { label: "JLA", detail: "Junior Leaders Academy" },
  { label: "PATS", detail: "Competition headquarters" },
  { label: "International", detail: "Partner editions" },
] as const;

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/operations", label: "Operations" },
  { href: "/international", label: "International" },
  { href: "/awards", label: "Awards" },
  { href: "/gallery", label: "Gallery" },
  { href: "/documents", label: "Documents" },
  { href: "/key-dates", label: "Key Dates" },
] as const;
