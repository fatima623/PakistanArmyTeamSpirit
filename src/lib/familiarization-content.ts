/**
 * Content for the "Familiarization of PATS" page (`/familiarization`).
 *
 * This page gathers the briefing material that participating contingents need
 * before arrival into a single navigation heading. Most of it is ALREADY
 * modelled elsewhere in the codebase, so this module deliberately re-exports
 * rather than re-authors:
 *
 *   - `TEAM_ROLES`          → team composition table       (@/lib/pats-content)
 *   - `OPERATIONAL_RULES`   → coordinating points          (@/lib/pats-content)
 *   - `ORIENTATION_MODULES` → pre-arrival familiarization  (@/lib/pats-content)
 *
 * The scored-event catalogue is deliberately NOT shown here — it lives on
 * /operations, which is the page built around it.
 *
 * Only material with no existing home on the site is declared here: the route
 * legs, the weapons/equipment scale, the explicit do / don't split, and the
 * facilitation, medical and legal aspects. The familiarization-training modules
 * moved here from /international and are re-exported below so the page has a
 * single import.
 *
 * Free text follows the same convention as `pats-content.ts` — English source
 * strings translated on the way out by `@/lib/i18n/pats-content-i18n`, which
 * falls back to English for anything it does not recognise.
 */

import { OPERATIONAL_RULES, ORIENTATION_MODULES } from "@/lib/pats-content";

/**
 * Pre-arrival familiarization training. Previously a section on
 * /international; it belongs with the rest of the pre-arrival brief, so the
 * page renders it here and /international no longer carries it.
 */
export const TRAINING_MODULES = ORIENTATION_MODULES;

/* ------------------------------------------------------------------ *
 * Concept — the exercise in one screen
 * ------------------------------------------------------------------ */

/**
 * The concept is briefed from a single diagram rather than prose, so the page
 * shows the briefing graphic itself. Dimensions are the intrinsic pixel size —
 * `next/image` needs them to reserve layout space before the file loads.
 */
export const CONCEPT_DIAGRAM = {
  src: "/images/concept-of-pats.png",
  width: 1332,
  height: 639,
} as const;

/**
 * Route legs in traverse order with the distances briefed on the concept
 * diagram. The legs sum to the 50–60 km total quoted above.
 */
export const CONCEPT_LEGS = [
  {
    id: "assembly",
    label: "Assembly Area",
    distance: null,
    body: "Teams report to the Assembly Area and the exercise begins immediately — there is no acclimatisation window once the patrol is received.",
  },
  {
    id: "infiltration",
    label: "Infiltration — Start Point to Hideout",
    distance: "23–25 km",
    body: "The longest leg. Teams infiltrate through terrorist-dominated territory to the hideout, navigating without any electronic aid.",
  },
  {
    id: "hideout",
    label: "Hideout to Target",
    distance: "15–18 km",
    body: "Occupation of the hideout, patrol base drills, helicopter landing zone selection and Quick Battle Orders for the reconnaissance.",
  },
  {
    id: "exfiltration",
    label: "Exfiltration",
    distance: "9–12 km",
    body: "After the Close Target Recce the patrol exfiltrates, submits the CTR report, and works through the remaining scored events on the way back.",
  },
  {
    id: "speed-march",
    label: "Terminal speed march",
    distance: "5 km",
    body: "A final speed march over a defined road or track into the terminal area, carrying a casualty load, before terminal inspection and debrief.",
  },
] as const;

/* ------------------------------------------------------------------ *
 * Terrain profile
 * ------------------------------------------------------------------ */

/**
 * The ground the patrol crosses and the conditions expected on it. Teams use
 * this to decide clothing, footwear and cold-weather routine before travelling,
 * so the numbers are stated exactly as briefed.
 */
export const TERRAIN_PROFILE = {
  /** Measurable facts, shown as a stat band. */
  facts: [
    { label: "Exercise area", value: "≈30 square kilometres" },
    { label: "Weather", value: "Cold, with fog expected" },
    { label: "Temperature", value: "5–16 °C" },
  ],
  /** Ground types the patrol moves across. */
  ground: [
    "Semi-mountains, cuttings and plains.",
    "Small and medium sized built-up areas.",
    "Narrow roads and tracks.",
  ],
  /** What that ground asks of the team. */
  demand:
    "The terrain demands a high degree of endurance and navigation skill — teams should prepare for sustained movement over mixed ground in cold, foggy conditions.",
} as const;

/* ------------------------------------------------------------------ *
 * Weapons & equipment
 * ------------------------------------------------------------------ */

/**
 * One row of the weapons & equipment scale. `indl` is the quantity carried by
 * each individual, `team` the quantity held once per team; `null` means the
 * item is not scaled on that axis (rendered as a dash, as on the booklet
 * table). Both are strings because a few rows are not plain counts
 * ("120 each", "1 + 1", "1000 Rds").
 */
export type EquipmentRow = {
  item: string;
  indl: string | null;
  team: string | null;
};

export type EquipmentGroup = {
  id: string;
  /**
   * Rows in booklet order. The two-column presentation is a layout choice, not
   * part of the data — the component splits this list down the middle so the
   * two tables always come out the same height.
   */
  rows: readonly EquipmentRow[];
};

/**
 * Weapons and equipment scale, transcribed from the booklet's two-table
 * spread. Group ids key the captions in
 * `t.marketing.familiarization.equipment.groups`.
 */
export const WEAPONS_EQUIPMENT: readonly EquipmentGroup[] = [
  {
    id: "personal",
    rows: [
      { item: "Combat dress / uniform", indl: "2", team: null },
      { item: "Field cap", indl: "1", team: null },
      { item: "T-Shirt", indl: "2", team: null },
      { item: "Socks (pair)", indl: "2", team: null },
      { item: "Boot (pairs)", indl: "1", team: null },
      { item: "Housewife kit", indl: "1", team: null },
      { item: "Anti snakebite kit", indl: "1", team: null },
      { item: "Shopper plastic for waste", indl: "1", team: null },
      {
        item: "Sub Machine Gun with 3 × spare magazines",
        indl: "1",
        team: null,
      },
      { item: "Ammunition (SMG)", indl: "120 each", team: null },
      { item: "Sub Machine Gun sling", indl: "1", team: null },
      { item: "Sub Machine Gun cleaning kit", indl: "1", team: null },
      { item: "Mess tin / food pan", indl: "1", team: null },
      { item: "Raincoat", indl: "1", team: null },
      { item: "Ground sheet", indl: "1", team: null },
      { item: "Ration pack / own arrangements", indl: "1", team: null },
      { item: "Harris set with 2 × batteries", indl: null, team: "1" },
      { item: "Entrenching tools", indl: null, team: "2" },
      { item: "Field / shell dressing + tourniquet", indl: "1 + 1", team: null },
      { item: "Light Machine Gun with night sight", indl: null, team: "1" },
      { item: "Ammunition (LMG)", indl: null, team: "1000 Rds" },
      { item: "Mine markers", indl: null, team: "16" },
      { item: "Wire cutter", indl: null, team: "2" },
      { item: "Section first aid kit bag", indl: null, team: "1" },
      { item: "Mine prodder", indl: null, team: "1" },
    ],
  },
  {
    id: "stores",
    rows: [
      { item: "Map case", indl: null, team: "1" },
      { item: "Compass", indl: null, team: "3" },
      { item: "Night vision goggles", indl: null, team: "2" },
      { item: "Service protractor", indl: null, team: "1" },
      { item: "Map set", indl: null, team: "1" },
      { item: "Binocular", indl: null, team: "2" },
      { item: "Writing material", indl: "1", team: null },
      { item: "Pocket knife", indl: "1", team: null },
      { item: "Big pack", indl: "1", team: null },
      { item: "Handcuffs", indl: null, team: "4" },
      { item: "9 millimetre rope (45 m)", indl: null, team: "1" },
      { item: "4 millimetre rope (45 m)", indl: null, team: "1" },
      { item: "Voice recorder", indl: null, team: "1" },
      { item: "Feeler stick", indl: null, team: "1" },
      { item: "Dagger", indl: null, team: "2" },
      { item: "Fish reel", indl: null, team: "1" },
      { item: "Letter H", indl: null, team: "1" },
      { item: "Windsock", indl: null, team: "1" },
      { item: "Helmet", indl: "1", team: null },
      { item: "Bevies bags", indl: null, team: "4" },
      { item: "Para cord 20 m", indl: "1", team: null },
      { item: "Pulley", indl: null, team: "1" },
      { item: "Gloves (pairs)", indl: "1", team: null },
      { item: "Rappelling gloves (pair)", indl: null, team: "2" },
      { item: "Camouflage kit", indl: null, team: "2" },
      { item: "Smoke grenades", indl: null, team: "4" },
      { item: "Hand grenades", indl: "2", team: null },
      { item: "Head comforter", indl: "1", team: null },
      { item: "Safety rope", indl: null, team: "2" },
      { item: "D ring closed", indl: "1", team: null },
      { item: "D ring open", indl: null, team: "4" },
    ],
  },
];

/** Standing note attached to the team composition table. */
export const TEAM_COMPOSITION_NOTE =
  "Any change in the rank of participants by a country must be communicated in the final list, to be shared by 15 December 2025.";

/* ------------------------------------------------------------------ *
 * Coordinating points
 * ------------------------------------------------------------------ */

/**
 * Coordination instructions briefed at the Main Planning Conference that are
 * not already covered by `OPERATIONAL_RULES`. Merged with that list by
 * `COORDINATING_POINTS` below so the page renders one continuous set.
 */
const ADDITIONAL_COORDINATION = [
  {
    id: "draws",
    title: "Infiltration draws",
    body: "Draws are held to fix the sequence in which teams infiltrate from the Start Point to the hideout.",
  },
  {
    id: "unauthorized",
    title: "Unauthorized contact",
    body: "Interaction with unauthorized individuals is not permitted at any stage of the exercise.",
  },
  {
    id: "open-fire",
    title: "Open fire prohibited",
    body: "Lighting of open fire anywhere in the exercise area is prohibited.",
  },
  {
    id: "snakebite",
    title: "Anti-snakebite kits",
    body: "All ranks must carry anti-snakebite kits and torches throughout the exercise.",
  },
  {
    id: "local-unit",
    title: "Attachment with a local unit",
    body: "Each team is attached to a local unit that acclimatises and trains it in firing with Pakistan Army weapons, or any other event the team requests.",
  },
] as const;

export type CoordinatingPoint = {
  id: string;
  title: string;
  body: string;
};

/** Coordinating points: existing operational rules plus the additions above. */
export const COORDINATING_POINTS: readonly CoordinatingPoint[] = [
  ...OPERATIONAL_RULES,
  ...ADDITIONAL_COORDINATION,
];

/* ------------------------------------------------------------------ *
 * Dos & Don'ts
 * ------------------------------------------------------------------ */

/** Affirmative obligations on every participating contingent. */
export const DOS = [
  "Carry anti-snakebite kits and torches at all times during the exercise.",
  "Obey Pakistan's laws and show respect for local customs throughout the visit.",
  "Bury all waste in the team's black plastic bags and present them at the finish point.",
  "Exercise due caution when moving near or across water channels.",
  "Complete pre-arrival familiarization on firing, navigation and map reading, signal equipment, CBRN, AFOS and area orientation.",
  "Communicate any change in participant ranks in the final list by 15 December 2025.",
  "Carry the full 200 kg team load, including filled water bottles, ammunition and the issued tracker.",
] as const;

/** Prohibitions — several of these carry a points penalty or disqualification. */
export const DONTS = [
  "Do not carry or use GPS or any unauthorized navigational aid, including watches and phones — this means disqualification.",
  "Do not enter build-up areas; all BUAs are strictly out of bounds.",
  "Do not seek help from civilians or locals at any point.",
  "Do not interact with unauthorized individuals.",
  "Do not light an open fire anywhere in the exercise area.",
  "Do not throw waste or litter in the exercise area.",
  "Do not shed any part of the scheduled weight — random weight checks are carried out during the exercise.",
  "Do not bathe or swim in rivers or water channels while moving.",
  "Do not expect food resupply — this is a survival exercise and no replenishment is permitted.",
  "Do not arrange independent media coverage; the Pakistan Army provides pictures and clips before departure.",
] as const;

/* ------------------------------------------------------------------ *
 * Facilitation, medical & legal
 * ------------------------------------------------------------------ */

/** What the Pakistan Army provides to visiting contingents. */
export const FACILITATION = [
  "Boarding in Pakistan Army accommodation near the exercise area with all necessary facilities.",
  "Weapons, ammunition and all types of equipment required for the competition.",
  "Maps for the exercise area.",
  "Internet facility at the accommodation.",
] as const;

/** Medical cover and the boundary of responsibility. */
export const MEDICAL = [
  "Complete medical cover is provided by the Pakistan Army from arrival until departure.",
  "Medical evacuation to the respective country remains the responsibility of the respective team and its management.",
] as const;

/** Legal position communicated to all participating nations. */
export const LEGAL = [
  "Participants obey Pakistan's laws and respect local customs.",
  "Participants are self-responsible for any possible injury or loss and shall not seek compensation.",
  "Independent media coverage is prohibited; the Pakistan Army provides pictures and clips to participants before departure.",
] as const;

/** Information each international team submits ahead of arrival. */
export const INFORMATION_REQUIRED = {
  deadline: "15 December 2025",
  items: [
    "Mode of travel by the team.",
    "Rank-wise lists of the team and officials, including blood groups.",
    "Copies of passports.",
    "Flight schedule of the team arriving for the competition.",
  ],
} as const;

/* ------------------------------------------------------------------ *
 * In-page anchors
 * ------------------------------------------------------------------ */

/**
 * Section anchors, in page order. The visible label for each comes from
 * `t.marketing.familiarization.anchors`, keyed by `id`.
 */
export const FAMILIARIZATION_ANCHORS = [
  "concept",
  "terrain",
  "route",
  "team",
  "equipment",
  "training",
  "coordination",
  "dos-donts",
  "facilitation",
] as const;

export type FamiliarizationAnchor = (typeof FAMILIARIZATION_ANCHORS)[number];
