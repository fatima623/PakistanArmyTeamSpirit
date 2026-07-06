/**
 * Exercise Contour — single source of truth for the operational dashboard.
 *
 * All events, equipment, rules and orientation data live here so the UI stays
 * a thin rendering layer. Icons are stored as Lucide icon *names* (strings) and
 * resolved to components in `src/components/exercise-contour/icon-map.ts` — this
 * keeps the data module free of React imports and reusable server-side.
 */

export type ContourIconName = string;

export type Difficulty = "Foundational" | "Standard" | "Advanced" | "Extreme";

export type EventCategory =
  | "Inspection"
  | "Command"
  | "Navigation"
  | "Reconnaissance"
  | "Combat"
  | "Medical"
  | "Intelligence";

export type ContourStat = {
  label: string;
  value: string;
  hint: string;
  icon: ContourIconName;
};

export type OverviewCard = {
  title: string;
  body: string;
  icon: ContourIconName;
};

export type TimelineStep = {
  id: string;
  label: string;
  phase: string;
  detail: string;
};

export type MarkBreakdown = { label: string; marks: number };

export type ContourEvent = {
  id: string;
  title: string;
  marks: number;
  icon: ContourIconName;
  category: EventCategory;
  difficulty: Difficulty;
  duration: string;
  summary: string;
  details: string;
  breakdown?: MarkBreakdown[];
  participants?: string;
};

export type EquipmentCategory = {
  id: string;
  title: string;
  icon: ContourIconName;
  items: string[];
};

export type RuleSeverity = "info" | "warning" | "critical";

export type ContourRule = {
  text: string;
  severity: RuleSeverity;
};

export type OrientationItem = {
  title: string;
  detail: string;
  icon: ContourIconName;
};

/* ------------------------------------------------------------------ *
 * Summary statistics (hero band)
 * ------------------------------------------------------------------ */

export const CONTOUR_STATS: ContourStat[] = [
  {
    label: "Competition Events",
    value: "27",
    hint: "Conducted over the exercise",
    icon: "Trophy",
  },
  {
    label: "Exercise Duration",
    value: "60 Hours",
    hint: "Continuous · no fixed rest",
    icon: "Clock",
  },
  {
    label: "Team Size",
    value: "8 Members",
    hint: "One patrol per nation",
    icon: "Users",
  },
  {
    label: "Maximum Team Weight",
    value: "200 KG",
    hint: "All kit, water & ammunition",
    icon: "Weight",
  },
  {
    label: "Weapons",
    value: "Provided",
    hint: "By the Pakistan Army",
    icon: "Crosshair",
  },
  {
    label: "Discipline",
    value: "Navigation & Tactical",
    hint: "Sub-conventional scenarios",
    icon: "Map",
  },
];

/* ------------------------------------------------------------------ *
 * Exercise overview
 * ------------------------------------------------------------------ */

export const CONTOUR_OVERVIEW: OverviewCard[] = [
  {
    title: "Assembly Area Start",
    body: "The exercise launches from a designated Assembly Area whose location is communicated to teams in advance.",
    icon: "MapPin",
  },
  {
    title: "Immediate Commencement",
    body: "After arrival at the Assembly Area the exercise begins immediately — there is no acclimatisation window.",
    icon: "PlayCircle",
  },
  {
    title: "≈ 60 Hours, Continuous",
    body: "The full competition lasts approximately 60 hours with no fixed sleeping or resting time allotted.",
    icon: "Clock",
  },
  {
    title: "Independent or Combined",
    body: "Events are conducted either independently or in combination, back-to-back, throughout the exercise window.",
    icon: "Layers",
  },
  {
    title: "Scenarios On the Move",
    body: "Teams receive their tactical scenarios during the exercise rather than beforehand — planning happens under pressure.",
    icon: "Radio",
  },
];

/* ------------------------------------------------------------------ *
 * Interactive timeline — conduct of events (in flow order)
 * ------------------------------------------------------------------ */

export const CONTOUR_TIMELINE: TimelineStep[] = [
  { id: "arrival", label: "Arrival at Assembly Area", phase: "Reception", detail: "Teams report to the Assembly Area; exercise clock starts." },
  { id: "initial-kit", label: "Initial Kit Inspection", phase: "Reception", detail: "Full team and equipment inspection; weight verified." },
  { id: "report-lines", label: "Report Lines", phase: "Movement", detail: "Cross imaginary report lines and report to Control HQ." },
  { id: "signal-comm", label: "Signal Communication", phase: "Skills", detail: "Voice procedure and handling of signal equipment." },
  { id: "weapon-recon", label: "Recognition of Weapons", phase: "Skills", detail: "Identify Chinese, Russian and NATO weapons." },
  { id: "verbal-orders", label: "Verbal Orders", phase: "Command", detail: "Patrol leader delivers verbal orders with a model." },
  { id: "navigation", label: "Navigation & Infiltration", phase: "Movement", detail: "Navigate terrorist-held ground on six-figure grids." },
  { id: "hideout", label: "Hideout Occupation", phase: "Field", detail: "Occupy a hideout and set defensive positions." },
  { id: "ctr", label: "Close Target Reconnaissance", phase: "Recce", detail: "Move to the FRV and reconnoitre the objective." },
  { id: "qbo", label: "Quick Battle Orders", phase: "Command", detail: "Prepare an enlargement and deliver battle orders." },
  { id: "first-aid", label: "First Aid", phase: "Response", detail: "Secure a heli crash site and treat casualties." },
  { id: "lz", label: "Landing Zone Selection", phase: "Field", detail: "Select, mark and secure a helicopter landing zone." },
  { id: "afos", label: "AFOS / ATGP", phase: "Combat", detail: "Conduct artillery observation on the simulator." },
  { id: "counter-ambush", label: "Counter Ambush", phase: "Combat", detail: "React to and negotiate an ambush site." },
  { id: "minefield", label: "Minefield Negotiation", phase: "Movement", detail: "Negotiate mine and IED prone areas tactically." },
  { id: "water-crossing", label: "Water Crossing", phase: "Movement", detail: "Cross a 40–50 m water obstacle with full kit." },
  { id: "incident-site", label: "Incident Site", phase: "Response", detail: "Respond to a civilian casualty incident." },
  { id: "firing", label: "Firing", phase: "Combat", detail: "Engage figure targets with SMG at 100–200 m." },
  { id: "stranger", label: "Stranger Handling", phase: "Intelligence", detail: "Gather intelligence from civilians securely." },
  { id: "cbrn", label: "CBRN", phase: "Response", detail: "Respond to a chemical attack in MOPP Level 4." },
  { id: "speed-march", label: "Speed March", phase: "Endurance", detail: "March 4–5 km carrying a 60 kg dummy casualty." },
  { id: "media", label: "Media Handling", phase: "Command", detail: "Captain handles a media interaction." },
  { id: "exfiltration", label: "Exfiltration", phase: "Movement", detail: "Navigate out through hostile territory." },
  { id: "section-assault", label: "Section Assault", phase: "Combat", detail: "Clear a terrorist hideout or compound." },
  { id: "ctr-report", label: "CTR Report Submission", phase: "Command", detail: "Submit a one-hour written mission report." },
  { id: "captured", label: "Captured Terrorist Handling", phase: "Intelligence", detail: "Apply apprehension and Geneva Convention drills." },
  { id: "terminal-kit", label: "Terminal Kit Inspection", phase: "Closure", detail: "Final kit inspection and weight verification." },
  { id: "debriefing", label: "Debriefing", phase: "Closure", detail: "Captain presents the exercise summary to umpires." },
];

/* ------------------------------------------------------------------ *
 * Competition events — the core catalogue (27)
 * ------------------------------------------------------------------ */

export const CONTOUR_EVENTS: ContourEvent[] = [
  {
    id: "initial-kit-inspection",
    title: "Initial Kit Inspection",
    marks: 100,
    icon: "ClipboardCheck",
    category: "Inspection",
    difficulty: "Standard",
    duration: "45 min",
    summary: "Full team and equipment inspection with a hard 200 KG weight ceiling.",
    details:
      "Inspect the complete team and all equipment and verify that the kit is serviceable. Total team weight — including filled water bottles, Harris wireless set, batteries, weapons, ammunition and tracker — must not exceed 200 KG.",
  },
  {
    id: "report-lines",
    title: "Report Lines",
    marks: 50,
    icon: "Flag",
    category: "Inspection",
    difficulty: "Foundational",
    duration: "Throughout",
    summary: "Report to Control HQ on crossing each of five report lines.",
    details:
      "Teams cross imaginary report lines during infiltration and exfiltration and must report to Control Headquarters at each. Five report lines exist, each carrying 10 marks.",
    breakdown: [
      { label: "Report line 1", marks: 10 },
      { label: "Report line 2", marks: 10 },
      { label: "Report line 3", marks: 10 },
      { label: "Report line 4", marks: 10 },
      { label: "Report line 5", marks: 10 },
    ],
  },
  {
    id: "signal-communication",
    title: "Signal Communication",
    marks: 50,
    icon: "Radio",
    category: "Intelligence",
    difficulty: "Standard",
    duration: "30 min",
    summary: "Voice procedure, equipment handling and theory tested on three members.",
    details:
      "Voice procedure, handling of signal equipment, practical handling and theoretical knowledge are tested. Three participants excluding the captain are selected for assessment.",
    participants: "3 members (excluding captain)",
  },
  {
    id: "recognition-of-weapons",
    title: "Recognition of Weapons & Equipment",
    marks: 100,
    icon: "ScanSearch",
    category: "Combat",
    difficulty: "Advanced",
    duration: "30 min",
    summary: "Identify Chinese, Russian and NATO weapons from replicas or photographs.",
    details:
      "Recognition of Chinese, Russian and NATO weapons using replicas or photographs. Three participants excluding the captain participate in the assessment.",
    participants: "3 members (excluding captain)",
  },
  {
    id: "verbal-orders",
    title: "Verbal Orders",
    marks: 100,
    icon: "Megaphone",
    category: "Command",
    difficulty: "Advanced",
    duration: "60 min (30 prep + 30 delivery)",
    summary: "Patrol leader delivers verbal orders in English with a terrain model.",
    details:
      "The patrol leader delivers verbal orders in English (the native language is also allowed). Preparation time is 30 minutes and presentation time is 30 minutes.",
    breakdown: [
      { label: "Delivery", marks: 30 },
      { label: "Contingency Planning", marks: 20 },
      { label: "Model Preparation", marks: 30 },
      { label: "Team Understanding", marks: 20 },
    ],
  },
  {
    id: "infiltration-navigation",
    title: "Infiltration / Navigation",
    marks: 150,
    icon: "Map",
    category: "Navigation",
    difficulty: "Extreme",
    duration: "Timed",
    summary: "Navigate terrorist-controlled ground using six-figure grid references.",
    details:
      "Teams navigate through terrorist-controlled territory using six-figure grid references, maintaining tactical drills throughout the move.",
    breakdown: [
      { label: "Tactical drills", marks: 50 },
      { label: "Time", marks: 100 },
    ],
  },
  {
    id: "occupation-of-hideout",
    title: "Occupation of Hideout",
    marks: 50,
    icon: "Tent",
    category: "Reconnaissance",
    difficulty: "Foundational",
    duration: "30 min",
    summary: "Occupy a hideout, establish defence and rehearse response drills.",
    details:
      "Teams occupy a selected hideout, establish defensive positions and perform the appropriate response drills.",
  },
  {
    id: "close-target-reconnaissance",
    title: "Close Target Reconnaissance",
    marks: 100,
    icon: "ScanEye",
    category: "Reconnaissance",
    difficulty: "Advanced",
    duration: "90 min",
    summary: "Move to the Final RV, close on the target and reconnoitre it.",
    details:
      "Evaluate the move to the Final Rendezvous, the movement to the target area, and the reconnaissance of the objective.",
    breakdown: [
      { label: "Final RV", marks: 25 },
      { label: "Movement", marks: 25 },
      { label: "Reconnaissance", marks: 50 },
    ],
  },
  {
    id: "quick-battle-orders",
    title: "Quick Battle Orders",
    marks: 50,
    icon: "ListChecks",
    category: "Command",
    difficulty: "Standard",
    duration: "30 min",
    summary: "Patrol leader builds an enlargement and delivers quick battle orders.",
    details:
      "The patrol leader prepares an enlargement / model and delivers quick battle orders to the team.",
    breakdown: [
      { label: "Delivery", marks: 10 },
      { label: "Planning", marks: 15 },
      { label: "Enlargement", marks: 15 },
      { label: "Team Understanding", marks: 10 },
    ],
  },
  {
    id: "heli-crash-first-aid",
    title: "Heli Crash & First Aid",
    marks: 50,
    icon: "HeartPulse",
    category: "Medical",
    difficulty: "Standard",
    duration: "40 min",
    summary: "Secure a crash site, rescue survivors and administer first aid.",
    details:
      "Secure a helicopter crash site, rescue survivors, recover important documents and administer first aid to the casualties.",
    breakdown: [
      { label: "Area Security", marks: 10 },
      { label: "Search & Rescue", marks: 10 },
      { label: "First Aid", marks: 30 },
    ],
  },
  {
    id: "landing-zone-selection",
    title: "Landing Zone Selection",
    marks: 50,
    icon: "PlaneLanding",
    category: "Reconnaissance",
    difficulty: "Standard",
    duration: "30 min",
    summary: "Select, mark and secure a helicopter landing zone near the base.",
    details:
      "Select and mark a helicopter landing zone near the patrol base. Securing the landing zone and correctly signalling helicopters are evaluated.",
  },
  {
    id: "afos-atgp-simulator",
    title: "AFOS / ATGP Simulator",
    marks: 50,
    icon: "Target",
    category: "Combat",
    difficulty: "Standard",
    duration: "30 min",
    summary: "Two members conduct artillery observation on the simulator.",
    details:
      "Two team members conduct artillery observation using the AFOS / ATGP simulator while the remaining team waits outside.",
    participants: "2 members",
  },
  {
    id: "counter-ambush",
    title: "Counter Ambush",
    marks: 50,
    icon: "ShieldAlert",
    category: "Combat",
    difficulty: "Advanced",
    duration: "20 min",
    summary: "React to an ambush and execute counter-ambush drills.",
    details:
      "Drills, reactions and tactical procedures are evaluated while the team negotiates an ambush site.",
  },
  {
    id: "minefield-ied-negotiation",
    title: "Minefield / IED Negotiation",
    marks: 50,
    icon: "Bomb",
    category: "Navigation",
    difficulty: "Advanced",
    duration: "30 min",
    summary: "Negotiate mine and IED prone areas with correct procedures.",
    details:
      "Teams negotiate minefields and improvised explosive device prone areas using proper tactical procedures.",
  },
  {
    id: "water-crossing",
    title: "Water Crossing",
    marks: 100,
    icon: "Waves",
    category: "Navigation",
    difficulty: "Extreme",
    duration: "45 min",
    summary: "Cross a 40–50 m water obstacle with full equipment.",
    details:
      "Cross a 40–50 metre water obstacle with full equipment, waterproofing kit and securing both banks during the tactical crossing.",
    breakdown: [
      { label: "Waterproofing Equipment", marks: 20 },
      { label: "Security of Banks", marks: 40 },
      { label: "Tactical Crossing", marks: 40 },
    ],
  },
  {
    id: "incident-site",
    title: "Incident Site",
    marks: 50,
    icon: "Siren",
    category: "Medical",
    difficulty: "Standard",
    duration: "30 min",
    summary: "Respond to a casualty incident involving civilians.",
    details:
      "Respond to a casualty incident involving civilians — securing the area, controlling the crowd and evacuating casualties.",
    breakdown: [
      { label: "Secure Area", marks: 20 },
      { label: "Crowd Control", marks: 20 },
      { label: "Casualty Evacuation", marks: 10 },
    ],
  },
  {
    id: "firing",
    title: "Firing",
    marks: 50,
    icon: "Crosshair",
    category: "Combat",
    difficulty: "Standard",
    duration: "3 min serial",
    summary: "Engage figure targets with SMG at 100–200 m — 8 rounds, 3 minutes.",
    details:
      "Fire using SMGs at figure targets from 100–200 metres while lying down. Eight bullets are fired within three minutes.",
  },
  {
    id: "dealing-with-stranger",
    title: "Dealing with Stranger",
    marks: 50,
    icon: "UserSearch",
    category: "Intelligence",
    difficulty: "Foundational",
    duration: "20 min",
    summary: "Gather intelligence from civilians while keeping operational security.",
    details:
      "Gather intelligence from civilians while maintaining operational security. Apprehension techniques are assessed.",
  },
  {
    id: "cbrn-test",
    title: "CBRN Test",
    marks: 100,
    icon: "Biohazard",
    category: "Medical",
    difficulty: "Extreme",
    duration: "45 min",
    summary: "Respond to a chemical attack in MOPP Level 4 kit.",
    details:
      "Respond to a chemical attack scenario using MOPP Level 4 equipment. Perform casualty handling, decontamination and sampling.",
  },
  {
    id: "speed-march",
    title: "Speed March",
    marks: 100,
    icon: "Footprints",
    category: "Navigation",
    difficulty: "Extreme",
    duration: "40 min qualifying",
    summary: "Cover 4–5 km carrying a 60 KG dummy casualty; 40 min to qualify.",
    details:
      "Cover 4–5 KM while carrying a 60 KG dummy casualty. The qualifying time is 40 minutes and penalties apply for delays.",
  },
  {
    id: "media-handling",
    title: "Media Handling",
    marks: 50,
    icon: "Mic",
    category: "Command",
    difficulty: "Standard",
    duration: "15 min",
    summary: "Captain's media interaction and communication skills assessed.",
    details:
      "The captain's media interaction and communication skills are evaluated in a simulated press engagement.",
  },
  {
    id: "exfiltration-navigation",
    title: "Exfiltration / Navigation",
    marks: 150,
    icon: "Route",
    category: "Navigation",
    difficulty: "Extreme",
    duration: "Timed",
    summary: "Navigate out through hostile territory under tactical movement.",
    details:
      "Navigate through hostile territory while maintaining tactical movement and completing the route within time.",
    breakdown: [
      { label: "Tactical Movement", marks: 50 },
      { label: "Timely Completion", marks: 100 },
    ],
  },
  {
    id: "section-assault",
    title: "Section Assault",
    marks: 50,
    icon: "Swords",
    category: "Combat",
    difficulty: "Extreme",
    duration: "30 min",
    summary: "Clear a terrorist hideout or compound; hostage rescue possible.",
    details:
      "Clear a terrorist hideout or compound. Hostage rescue may also be assessed as part of the serial.",
  },
  {
    id: "ctr-report",
    title: "Submission of CTR Report",
    marks: 200,
    icon: "FileText",
    category: "Command",
    difficulty: "Advanced",
    duration: "60 min",
    summary: "One-hour written report on mission, terrain, enemy and chronology.",
    details:
      "A one-hour written report describing the mission, terrain, enemy, options adopted, chronology and conclusions.",
    breakdown: [
      { label: "Mission Description", marks: 50 },
      { label: "Terrain & Enemy", marks: 50 },
      { label: "Options Adopted", marks: 50 },
      { label: "Chronological Report", marks: 50 },
    ],
  },
  {
    id: "handling-captured-terrorist",
    title: "Handling of Captured Terrorist",
    marks: 50,
    icon: "Lock",
    category: "Intelligence",
    difficulty: "Standard",
    duration: "20 min",
    summary: "Apprehension technique and Geneva Convention knowledge assessed.",
    details:
      "Apprehension techniques and knowledge of the Geneva Convention are assessed during handling of a captured terrorist.",
  },
  {
    id: "terminal-kit-inspection",
    title: "Terminal Kit Inspection",
    marks: 50,
    icon: "ClipboardList",
    category: "Inspection",
    difficulty: "Foundational",
    duration: "30 min",
    summary: "Final equipment inspection and verification of the 200 KG weight.",
    details:
      "Final inspection of the complete equipment and verification of the total team weight (200 KG).",
  },
  {
    id: "debriefing",
    title: "Debriefing",
    marks: 100,
    icon: "Presentation",
    category: "Command",
    difficulty: "Advanced",
    duration: "30 min",
    summary: "Captain presents the exercise summary; umpires question the team.",
    details:
      "The captain presents a complete exercise summary followed by questions from the umpires. The time limit is 30 minutes with penalties for exceeding it.",
  },
];

export const EVENT_CATEGORIES: EventCategory[] = [
  "Inspection",
  "Command",
  "Navigation",
  "Reconnaissance",
  "Combat",
  "Medical",
  "Intelligence",
];

export const DIFFICULTIES: Difficulty[] = [
  "Foundational",
  "Standard",
  "Advanced",
  "Extreme",
];

export const TOTAL_EVENT_MARKS = CONTOUR_EVENTS.reduce(
  (sum, event) => sum + event.marks,
  0
);

/* ------------------------------------------------------------------ *
 * Weapons & equipment
 * ------------------------------------------------------------------ */

export const CONTOUR_EQUIPMENT: EquipmentCategory[] = [
  {
    id: "personal",
    title: "Personal Equipment",
    icon: "Backpack",
    items: [
      "Combat Dress",
      "Field Cap",
      "T-Shirt",
      "Socks",
      "Boots",
      "Housewife Kit",
      "Anti-Snake Bite Kit",
      "Plastic Waste Bag",
      "Cleaning Kit",
      "Compass",
      "Night Vision Goggles",
      "Service Protractor",
      "Gloves",
      "Helmet",
      "Camouflage Kit",
      "Reflective Vest",
      "Pull Over",
      "Head Comforter",
    ],
  },
  {
    id: "weapons",
    title: "Weapons",
    icon: "Crosshair",
    items: [
      "SMG",
      "Light Machine Gun",
      "Spare Magazines",
      "SMG Ammunition",
      "LMG Ammunition (1000 rounds)",
      "LMG Night Sight",
      "Pocket Knife",
      "Dagger",
      "Hand Grenades",
      "Smoke Grenades",
    ],
  },
  {
    id: "communication",
    title: "Communication Equipment",
    icon: "Radio",
    items: [
      "Wireless Set",
      "Spare Battery",
      "Harris Set",
      "Voice Recorder",
      "Tracker",
    ],
  },
  {
    id: "navigation",
    title: "Navigation Equipment",
    icon: "Map",
    items: [
      "Map Set",
      "Map Case",
      "Compass",
      "Binoculars",
      "Writing Material",
    ],
  },
  {
    id: "medical",
    title: "Medical Equipment",
    icon: "HeartPulse",
    items: [
      "Field Dressing",
      "Tourniquet",
      "First Aid Bag",
      "Anti-Snake Bite Kit",
    ],
  },
  {
    id: "engineering",
    title: "Engineering & Survival",
    icon: "Wrench",
    items: [
      "Entrenching Tool",
      "Ground Sheet",
      "Mess Tin / Food Pan",
      "MRE Ration Pack",
      "Torch with Colored Paper",
      "Wire Cutter",
      "Mine Detector",
      "Mine Probe",
      "Water Bottle with Cover",
      "Safety Rope",
      "Para Cord",
      "D-Rings",
      "Pulley",
      "Fish Reel",
      "Windsock",
      "Backpack",
      "Waterproof Backpack Cover",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Rules, coordinating points & do's / don'ts
 * ------------------------------------------------------------------ */

export const CONTOUR_RULES: ContourRule[] = [
  { text: "The exercise is conducted under sub-conventional operational scenarios.", severity: "info" },
  { text: "Approximately 20–22 tests are conducted for each team (from the full catalogue of events).", severity: "info" },
  { text: "Pakistan Army provides trackers to monitor teams throughout.", severity: "info" },
  { text: "Random weight inspections are conducted at any time.", severity: "warning" },
  { text: "Waste must be collected in plastic bags and presented at the finish.", severity: "warning" },
  { text: "Every member must carry an Anti-Snake Bite Kit and a torch.", severity: "warning" },
  { text: "Weapons are fired without re-zeroing after the exercise.", severity: "warning" },
  { text: "This is a survival exercise — no food is supplied; teams survive on their own MREs.", severity: "warning" },
  { text: "A medical replacement costs 300 penalty points.", severity: "critical" },
  { text: "A second replacement costs 200 penalty points.", severity: "critical" },
  { text: "Team weight exceeding 200 KG incurs a 100-point deduction.", severity: "critical" },
  { text: "GPS devices, watches with GPS and mobile phones are strictly prohibited.", severity: "critical" },
  { text: "Built-Up Areas (BUAs) are Out of Bounds.", severity: "critical" },
  { text: "No civilian assistance is allowed.", severity: "critical" },
  { text: "Swimming in rivers or water channels is prohibited.", severity: "critical" },
  { text: "Violations result in disqualification.", severity: "critical" },
];

/* ------------------------------------------------------------------ *
 * International team orientation
 * ------------------------------------------------------------------ */

export const CONTOUR_ORIENTATION: OrientationItem[] = [
  { title: "Pakistan Army Weapons", detail: "Familiarisation with the weapons issued for the exercise.", icon: "Crosshair" },
  { title: "Weapon Zeroing", detail: "Zeroing of issued weapons ahead of the firing serial.", icon: "Target" },
  { title: "Navigation & Map Reading", detail: "Six-figure grids, protractor work and route planning.", icon: "Map" },
  { title: "Signal Equipment", detail: "Voice procedure and handling of the Harris / wireless sets.", icon: "Radio" },
  { title: "CBRN Procedures", detail: "MOPP levels, decontamination and sampling drills.", icon: "Biohazard" },
  { title: "AFOS / ATGP Systems", detail: "Operating the artillery observation simulator.", icon: "Target" },
  { title: "Area Orientation", detail: "Terrain, climate and area brief before the competition.", icon: "Compass" },
];

export function getContourEventById(id: string): ContourEvent | undefined {
  return CONTOUR_EVENTS.find((event) => event.id === id);
}
