// English — source of truth for the two booklet-derived public pages:
// /operations (mission selection + drill catalogue) and /documents (reference
// library). Other locales mirror this shape exactly (enforced via `typeof`).
//
// Only page chrome and the closed vocabularies (phase / category / difficulty)
// live here. The drill, checkpoint, rule, glossary and overview rows come from
// the shared `@/lib/pats-content` module — which is imported by several pages
// this section does not own, so it cannot be reshaped — and their free text is
// localized by `@/lib/i18n/pats-content-i18n` instead.

import type { FamiliarizationAnchor } from "@/lib/familiarization-content";
import type { DrillCategory, DrillPhase, TacticalDrill } from "@/lib/pats-content";

export const marketing = {
  operations: {
    meta: {
      title: "Operations",
      description:
        "Tactical drills, checkpoints, and scoring for the PATS competition.",
    },

    hero: {
      eyebrow: "Mission selection",
      title: "Operations",
      subtitle:
        "Select a tactical event. Each mission brief includes objectives, scoring matrix, and operational phase alignment.",
      metaEvents: "Events",
      metaTotalMarks: "Total marks",
      metaDuration: "Duration",
      metaDurationValue: "60 hours",
    },

    overview: {
      eyebrow: "Mission",
      title: "Operational overview",
    },

    /**
     * Result line under the overview highlights, e.g.
     * "27 scored events · 2,150 total marks across the exercise".
     * `marks` arrives pre-formatted so the caller controls digit grouping.
     * The explicit `string` return keeps the Dictionary type open — without it
     * TS infers a literal type and the other locales fail to satisfy it.
     */
    scoredSummary: (events: number, marks: string): string =>
      `${events} scored ${events === 1 ? "event" : "events"} · ${marks} total marks across the exercise`,

    route: {
      eyebrow: "Route",
      title: "Layout of events",
      description:
        "Checkpoint sequence from assembly through infiltration, CTR, and exfiltration.",
    },

    map: {
      routeTitle: "Exercise route — live sequence",
      glossaryTitle: "Operational HUD — terminology",
      /** Badge on the first / last route node (kept short — it sits in a 36px circle). */
      entry: "IN",
      exit: "OUT",
    },

    /** Section headings per operational phase; also the Phase value on a brief. */
    phases: {
      preparation: "Preparation",
      infiltration: "Infiltration",
      hideout: "Hideout",
      ctr: "Close target reconnaissance",
      exfiltration: "Exfiltration",
      terminal: "Terminal phase",
    } as Record<DrillPhase, string>,

    /** e.g. "4 evaluated events in this phase." */
    phaseSummary: (count: number): string =>
      `${count} evaluated ${count === 1 ? "event" : "events"} in this phase.`,

    /** Accessible name for the per-phase card carousel. */
    phaseCarouselAria: (phase: string): string => `${phase} competition events`,

    rules: {
      eyebrow: "Rules",
      title: "Coordinating points",
      description:
        "Operational notices and penalties — failure to comply may result in disqualification.",
    },

    card: {
      missionBrief: "Mission brief",
    },

    difficulty: {
      foundational: "Foundational",
      intermediate: "Intermediate",
      advanced: "Advanced",
      elite: "Elite",
    } as Record<TacticalDrill["difficulty"], string>,

    category: {
      inspection: "Inspection",
      communications: "Communications",
      navigation: "Navigation",
      reconnaissance: "Reconnaissance",
      medical: "Medical",
      fires: "Fire support",
      assault: "Assault",
      survival: "Survival",
      admin: "Administration",
    } as Record<DrillCategory, string>,

    brief: {
      /** Back link to /operations. The arrow is written per-locale so RTL flips it. */
      back: "← Mission selection",
      classified: "Classified operational brief",
      totalMarks: "Total marks",
      phase: "Phase",
      category: "Category",
      difficulty: "Difficulty",
      checkpoint: "Checkpoint",
      objective: "Mission objective",
      objectives: "Operational objectives",
      scoring: "Scoring matrix",
      /** Abbreviated unit after a scoring row's marks, e.g. "30 mks". */
      marksUnit: "mks",
      criticalNotice: "Critical notice",
      skills: "Tactical skills",
      relatedArchive: "Related archive",
      allMissions: "All missions",
      /** <title> when the drill id in the URL matches nothing. */
      fallbackTitle: "Operation",
    },
  },

  documents: {
    meta: {
      title: "Documents",
      description:
        "Official PATS competition reference — interactive briefs aligned to the information booklet.",
    },

    hero: {
      eyebrow: "Reference library",
      title: "Document center",
      subtitle:
        "Official PATS competition reference — browse interactive briefs aligned to the information booklet.",
      metaSource: "Source",
      metaSourceValue: "Official booklet",
      metaAccess: "Access",
      metaAccessValue: "Digital briefs",
    },

    library: {
      eyebrow: "Reference",
      title: "Competition library",
      description:
        "Each topic links to the matching section on this site. Full booklet scans are not shown — use the structured briefs below.",
    },

    downloadResults: "Download results PDF",
    /** Arrow written per-locale so RTL points the other way. */
    interactiveOperations: "Interactive operations →",
    /** e.g. "Booklet p.17" */
    bookletPage: (page: number): string => `Booklet p.${page}`,
    openBrief: "Open brief →",

    /** Booklet topics; each links to the matching section elsewhere on the site. */
    sections: {
      overview: "Overview — PATS",
      history: "History — International teams",
      concept: "Concept of PATS",
      layout: "Layout of events",
      conduct: "Conduct of events (part 1)",
      teamComposition: "Team composition",
      scoresAwards: "Scores & awards",
      weaponEquipment: "Weapon & equipment",
      coordinatingPoints: "Coordinating points",
    },
  },

  /**
   * /familiarization — the pre-arrival brief. Page chrome only; the terrain,
   * route, team, equipment, coordination and do/don't rows come from
   * `@/lib/familiarization-content` (and, through it, `@/lib/pats-content`)
   * and are localized by `@/lib/i18n/pats-content-i18n`.
   */
  familiarization: {
    meta: {
      title: "Familiarization of PATS",
      description:
        "Pre-arrival brief for participating contingents — concept of PATS, terrain and route, team composition, the weapons and equipment scale, and coordinating points.",
    },

    hero: {
      eyebrow: "Pre-arrival brief",
      title: "Familiarization of PATS",
      subtitle:
        "Everything a participating contingent needs before arrival — the concept of the exercise, the ground and the route, team composition, the weapons and equipment scale, and the coordinating points that govern conduct.",
      metaDuration: "Exercise",
      metaDurationValue: "60 hours",
      metaDistance: "Traverse",
      metaDistanceValue: "50–60 km",
      metaTeam: "Patrol",
      metaTeamValue: "8 members",
    },

    /** Sticky in-page rail. Keys match `FAMILIARIZATION_ANCHORS`. */
    anchorsAria: "Sections on this page",
    anchors: {
      concept: "Concept",
      terrain: "Terrain",
      route: "Route",
      team: "Team",
      equipment: "Equipment",
      training: "Training",
      coordination: "Coordination",
      "dos-donts": "Dos & Don'ts",
      facilitation: "Facilitation",
    } as Record<FamiliarizationAnchor, string>,

    concept: {
      eyebrow: "Concept",
      title: "Concept of PATS",
      description:
        "A mission- and task-oriented patrolling competition run under a sub-conventional scenario, assessing tactical expertise, endurance and soldierly attributes over a continuous 60-hour exercise.",
      /** Alt text for the concept briefing diagram. */
      imageAlt:
        "Concept diagram of PATS: the assembly area, the infiltration route through the terrorist-dominated area to the hideout and target, the exfiltration leg and the terminal speed march, with the tasks conducted at each checkpoint.",
      imageCaption:
        "Concept of PATS — briefing diagram issued at the Main Planning Conference.",
    },

    terrain: {
      eyebrow: "Ground",
      title: "Terrain profile",
      description:
        "The ground the patrol crosses and the conditions expected on it — read this before deciding clothing, footwear and cold-weather routine.",
      groundTitle: "Ground",
      demandTitle: "Demands on the patrol",
    },

    route: {
      eyebrow: "Route",
      title: "Layout of the exercise",
      description:
        "The patrol moves from the assembly area through infiltration, the hideout, close target reconnaissance and exfiltration to the terminal area.",
      distanceLabel: "Distance",
      totalLabel: "Total traverse",
      totalValue: "50–60 km",
    },

    team: {
      eyebrow: "Organization",
      title: "Team composition",
      description:
        "Each nation fields one patrol — an eight-member reconnaissance team plus a reserve pair and a team manager.",
      roleHeading: "Appointment",
      strengthHeading: "Strength",
      noteLabel: "Note",
    },

    equipment: {
      eyebrow: "Scale",
      title: "Weapons & equipment",
      description:
        "The full scale carried by each participant and held once per team. Quantities are as issued — nothing may be shed en route, and random weight checks are carried out during the exercise.",
      itemHeading: "Items",
      indlHeading: "Per Indl",
      teamHeading: "Per Team",
      /** Screen-reader text for the "—" shown where a row is not scaled. */
      notApplicable: "Not applicable",
      /** Table captions, keyed by `EquipmentGroup.id`. */
      groups: {
        personal: "Clothing, weapons and personal kit",
        stores: "Navigation, technical and specialist stores",
      } as Record<string, string>,
      note: "Total team load is 200 kg including filled water bottles, ammunition and the issued tracker. Remaining equipment is as per the issued instructions.",
    },

    training: {
      eyebrow: "Orientation",
      title: "Familiarization training",
      description:
        "Pre-competition orientation for international teams, completed before movement into the exercise area, with special emphasis on:",
    },

    coordination: {
      eyebrow: "Coordination",
      title: "Coordinating points",
      description:
        "Instructions issued at the Main Planning Conference. Failure to comply may carry a points penalty or disqualification.",
    },

    dosDonts: {
      eyebrow: "Conduct",
      title: "Dos & Don'ts",
      description:
        "The obligations and prohibitions that apply to every participant for the duration of the visit.",
      dos: "Do",
      donts: "Don't",
    },

    facilitation: {
      eyebrow: "Support",
      title: "Facilitation, medical & legal",
      description:
        "What the Pakistan Army provides, where medical responsibility sits, and the legal position communicated to all participating nations.",
      facilitationTitle: "Provided by the Pakistan Army",
      medicalTitle: "Medical cover",
      legalTitle: "Legal aspects",
      informationTitle: "Information required from teams",
      /** e.g. "Due by 15 December 2025" */
      informationDeadline: (deadline: string): string => `Due by ${deadline}`,
    },

  },

  /** Shared arrows for the ForestCardCarousel (only /operations mounts it today). */
  carousel: {
    prev: "Previous cards",
    next: "Next cards",
  },
};
