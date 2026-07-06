/**
 * Structured PATS competition content extracted from official booklet media.
 * Powers drills, awards, international history, operations, and documents UX.
 */

export const PATS_MOTTO = "NO GUTS NO GLORY";
export const PATS_ESSENCE =
  "Perseverance acclaimed through Team Spirit";

export const OVERVIEW = {
  title: "Overview — PATS",
  lead: "Pakistan Army Team Spirit (PATS) is a mission- and task-oriented patrolling competition organized annually under JLA — PATS.",
  body: [
    "The exercise is manifested by the highest standards of physical fitness, robustness, tactical expertise, and soldierly attributes.",
    "The main aim is a demanding patrolling exercise to assess and enhance tactical and mental abilities — participants must be prepared mentally and physically.",
    "Teams must achieve proficiency in minor operations, endurance, and prowess in basic drills and procedures.",
  ],
  highlights: [
    { label: "Duration", value: "60 hours (3 days / 2 nights)" },
    { label: "Patrol size", value: "8 × personnel reconnaissance patrol" },
    { label: "Area", value: "30 × 30 km operational box" },
    { label: "Distance", value: "50–60 km traverse" },
    { label: "Scenarios", value: "20–22 tactical tests" },
  ],
} as const;

export const HISTORY = {
  founded: 2005,
  internationalSince: 2016,
  editionsHeld: 8,
  narrative: [
    "Since 2005, PATS began as a navigation exercise emphasizing endurance and physical fitness.",
    "Lessons from counter-terrorism operations were incorporated as realistic events and battlefield scenarios — sub-tactical operations in conventional and sub-conventional environments.",
    "Growing interest from friendly countries led to International PATS (2016), sharing rich experiences and learning mutually.",
  ],
} as const;

export type CountryCode =
  | "CN" | "TR" | "JO" | "MY" | "GB" | "LK" | "SA" | "ZA" | "UZ" | "KE"
  | "MA" | "NP" | "IQ" | "TH" | "QA" | "US" | "KZ" | "BH" | "PK" | "BY"
  | "AZ" | "GH" | "MV";

export const INTERNATIONAL_EDITIONS = [
  { edition: 2, year: 2017, countries: ["CN", "TR", "JO", "MY", "GB", "LK"] as CountryCode[] },
  { edition: 3, year: 2020, countries: ["SA", "LK", "ZA", "TR"] as CountryCode[] },
  { edition: 4, year: 2021, countries: ["JO", "LK", "TR", "UZ"] as CountryCode[] },
  { edition: 5, year: 2022, countries: ["KE", "SA", "JO", "LK", "TR", "MA", "NP", "UZ"] as CountryCode[] },
  { edition: 6, year: 2023, countries: ["SA", "IQ", "JO", "TH", "QA", "US", "MA", "KZ", "UZ"] as CountryCode[] },
  { edition: 7, year: 2024, countries: ["BH", "JO", "KZ", "SA", "PK", "MA", "QA", "TR", "MY", "TH", "US", "LK", "UZ"] as CountryCode[] },
  { edition: 8, year: 2025, countries: ["LK", "TR", "NP", "UZ", "BH", "SA", "MA", "CN", "US", "PK", "BY"] as CountryCode[] },
] as const;

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  CN: "China",
  TR: "Turkey",
  JO: "Jordan",
  MY: "Malaysia",
  GB: "United Kingdom",
  LK: "Sri Lanka",
  SA: "Saudi Arabia",
  ZA: "South Africa",
  UZ: "Uzbekistan",
  KE: "Kenya",
  MA: "Morocco",
  NP: "Nepal",
  IQ: "Iraq",
  TH: "Thailand",
  QA: "Qatar",
  US: "United States",
  KZ: "Kazakhstan",
  BH: "Bahrain",
  PK: "Pakistan",
  BY: "Belarus",
  AZ: "Azerbaijan",
  GH: "Ghana",
  MV: "Maldives",
};

export const TEAM_ROLES = [
  { role: "Team Leader", qty: "1 × Captain / Subaltern", count: 1 },
  { role: "Team 2nd In Command", qty: "1 × Sergeant / Equivalent", count: 1 },
  { role: "Team NCO", qty: "1 × Corporal / Equivalent", count: 1 },
  { role: "Light Machine Gun No.1", qty: "1 × Soldier / Equivalent", count: 1 },
  { role: "Light Machine Gun No.2", qty: "1 × Soldier / Equivalent", count: 1 },
  { role: "Signal Operator", qty: "1 × Soldier / Equivalent", count: 1 },
  { role: "Rifleman", qty: "2 × Soldier / Equivalent", count: 2 },
  { role: "Reserve", qty: "1 × Captain/Subaltern + 1 × Sergeant/Soldier", count: 2 },
  { role: "Team Manager", qty: "1 × Major", count: 1 },
] as const;

export const AWARD_TIERS = [
  { tier: "Gold", range: "75% and above", medal: "gold" as const },
  { tier: "Silver", range: "65% – 74.99%", medal: "silver" as const },
  { tier: "Bronze", range: "55% – 64.99%", medal: "bronze" as const },
  { tier: "Certificate", range: "Below 55%", medal: "certificate" as const },
] as const;

export type DrillPhase =
  | "preparation"
  | "infiltration"
  | "hideout"
  | "ctr"
  | "exfiltration"
  | "terminal";

export type DrillCategory =
  | "inspection"
  | "communications"
  | "navigation"
  | "reconnaissance"
  | "medical"
  | "fires"
  | "assault"
  | "survival"
  | "admin";

export type ScoringLine = { label: string; marks: number };

export type TacticalDrill = {
  id: string;
  title: string;
  marks: number;
  phase: DrillPhase;
  category: DrillCategory;
  checkpoint?: string;
  purpose: string;
  objectives: string[];
  scoring?: ScoringLine[];
  difficulty: "foundational" | "intermediate" | "advanced" | "elite";
  skills: string[];
  rules?: string[];
  bookletPage?: number;
};

export const CHECKPOINTS = [
  {
    id: "assy",
    label: "Assembly Area",
    phase: "E-Day",
    distance: null,
    activities: [
      "Kit inspection",
      "Quad copter handling",
      "Weapon recognition",
      "Model / verbal orders prep",
    ],
  },
  {
    id: "cp1",
    label: "Checkpoint 1",
    distance: "8–10 km",
    activities: ["POW handling", "Minefield clearance"],
  },
  {
    id: "cp2",
    label: "Checkpoint 2",
    distance: "7–9 km",
    activities: ["Dealing with stranger", "Report / communication lines"],
  },
  {
    id: "cp3",
    label: "Checkpoint 3 / Hideout",
    distance: "7–9 km",
    activities: [
      "Establish occupation of HO",
      "Heli LZ selection",
      "QBOs for CTR / exfiltration",
    ],
  },
  {
    id: "cp4",
    label: "Checkpoint 4 / CTR",
    distance: "9–10 km",
    activities: ["CTR drill"],
  },
  {
    id: "cp5",
    label: "Checkpoint 5",
    distance: "7–8 km",
    activities: ["CTR report submission", "Section assault", "CBRN"],
  },
  {
    id: "cp6",
    label: "Checkpoint 6",
    distance: "7–9 km",
    activities: [
      "Ambush / anti-ambush",
      "Incident site / first aid",
      "Media handling",
      "Speed march",
    ],
  },
  {
    id: "finish",
    label: "Assembly (E+2)",
    distance: "4–5 km speed march",
    activities: [
      "Firing",
      "Terminal kit inspection",
      "Water crossing",
      "Debrief",
      "AFOS / ATGP",
    ],
  },
] as const;

export const TACTICAL_DRILLS: TacticalDrill[] = [
  {
    id: "kit-inspection",
    title: "Initial Kit Inspection",
    marks: 100,
    phase: "preparation",
    category: "inspection",
    checkpoint: "Assy Area",
    purpose: "Validate team readiness and load discipline before infiltration.",
    objectives: [
      "Serviceable kit of any authorized pattern",
      "Complete team inspection",
      "Total team weight 200 kg including weapons, ammunition, tracker, filled water bottle, Harris set with 2× spare batteries",
      "Equipment complete per instructions",
    ],
    difficulty: "foundational",
    skills: ["Load management", "Equipment discipline"],
    bookletPage: 8,
  },
  {
    id: "report-lines",
    title: "Report Lines",
    marks: 50,
    phase: "infiltration",
    category: "communications",
    purpose: "Assess command and control during infiltration and exfiltration.",
    objectives: [
      "Five imaginary navigation report lines (10 marks each)",
      "Reports to control headquarters on crossing",
      "No fixed pattern — lines may appear anywhere during move",
    ],
    difficulty: "intermediate",
    skills: ["Reporting", "Navigation", "Comms discipline"],
    bookletPage: 8,
  },
  {
    id: "signal-communication",
    title: "Signal Communication",
    marks: 50,
    phase: "preparation",
    category: "communications",
    purpose: "Test voice procedure and practical signal equipment handling.",
    objectives: [
      "Voice procedure and equipment theory (viva + practical)",
      "Three members tested (excluding team captain), selected by umpiring staff",
    ],
    difficulty: "intermediate",
    skills: ["Radio procedure", "Signal equipment"],
    bookletPage: 9,
  },
  {
    id: "weapon-recognition",
    title: "Recognition of Weapons & Equipment",
    marks: 100,
    phase: "preparation",
    category: "inspection",
    purpose: "Confirm familiarity with multinational ordnance profiles.",
    objectives: [
      "China, Russia, and NATO weapons/equipment",
      "Practical test for 3 individuals (excluding team captain)",
      "Replicas or pictures used",
    ],
    difficulty: "intermediate",
    skills: ["Weapons ID", "Equipment knowledge"],
    bookletPage: 9,
  },
  {
    id: "verbal-orders",
    title: "Verbal Orders / Infiltration",
    marks: 100,
    phase: "preparation",
    category: "admin",
    purpose: "Evaluate leadership, planning, and team comprehension before move.",
    objectives: [
      "Orders in English (native language permitted)",
      "30 min preparation + 30 min delivery (1 hour total)",
      "1 mark penalty per 2 minutes over limit",
    ],
    scoring: [
      { label: "Delivery of verbal orders", marks: 30 },
      { label: "Contingency planning", marks: 20 },
      { label: "Model preparation (30 min)", marks: 30 },
      { label: "Team comprehension", marks: 20 },
    ],
    difficulty: "advanced",
    skills: ["Leadership", "Planning", "Briefing"],
    bookletPage: 9,
  },
  {
    id: "infiltration-navigation",
    title: "Infiltration / Navigation",
    marks: 150,
    phase: "infiltration",
    category: "navigation",
    checkpoint: "CP 1–2",
    purpose: "Navigate terrorist-dominated terrain under time and tactical pressure.",
    objectives: [
      "Six-figure grid references at each checkpoint",
      "Tactical drills during move: 50 marks",
      "Pace requirement 2 km/hr: 100 marks",
    ],
    difficulty: "elite",
    skills: ["Map reading", "Tactical movement", "Endurance"],
    bookletPage: 9,
  },
  {
    id: "hideout-occupation",
    title: "Occupation of Hideout & Drills",
    marks: 50,
    phase: "hideout",
    category: "survival",
    checkpoint: "CP 3 / HO",
    purpose: "Select and secure hideout; react if compromised.",
    objectives: [
      "Six-figure grid reference to checkpoint",
      "Select hideout within given area",
      "Occupation drills and compromise response",
    ],
    difficulty: "advanced",
    skills: ["Concealment", "SOPs", "Security"],
    bookletPage: 10,
  },
  {
    id: "ctr-drills",
    title: "Close Target Reconnaissance (CTR)",
    marks: 100,
    phase: "ctr",
    category: "reconnaissance",
    checkpoint: "CP 4 / CTR",
    purpose: "Execute technical and tactical CTR against enemy location.",
    objectives: [
      "Method of movement to enemy location",
      "Technical/tactical CTR drills assessed",
    ],
    scoring: [
      { label: "Occupation of final RV", marks: 25 },
      { label: "Movement from RV to target", marks: 25 },
      { label: "Conduct of reconnaissance", marks: 50 },
    ],
    difficulty: "elite",
    skills: ["Reconnaissance", "Stealth", "Observation"],
    bookletPage: 10,
  },
  {
    id: "qbo-ctr-exfil",
    title: "Quick Battle Orders — CTR / Exfiltration",
    marks: 50,
    phase: "ctr",
    category: "admin",
    purpose: "Rapid orders under time pressure for CTR or exfiltration.",
    objectives: [
      "Patrol leader delivers QBOs in English (native permitted)",
      "10 min preparation + 10 min delivery (20 min total)",
    ],
    scoring: [
      { label: "Delivery of order", marks: 10 },
      { label: "Contingency planning", marks: 15 },
      { label: "Preparation of enlargement", marks: 15 },
      { label: "Team comprehension", marks: 10 },
    ],
    difficulty: "advanced",
    skills: ["Battle orders", "Leadership"],
    bookletPage: 10,
  },
  {
    id: "heli-crash-first-aid",
    title: "Helicopter Crash / First Aid",
    marks: 50,
    phase: "hideout",
    category: "medical",
    purpose: "Secure crash site and evacuate casualties from the battlefield.",
    objectives: [
      "Secure area: 10 marks",
      "Search survivors / documents: 10 marks",
      "First aid to survivors: 30 marks",
    ],
    difficulty: "advanced",
    skills: ["Medical", "Site security"],
    bookletPage: 11,
  },
  {
    id: "heli-lz",
    title: "Landing Zone Selection & Heli Drills",
    marks: 50,
    phase: "hideout",
    category: "survival",
    purpose: "Select, mark, and secure helicopter landing zones.",
    objectives: [
      "LZ within/near hideout or patrol base (4-figure grid)",
      "Calling heli support and LZ selection",
      "Site security and marking equipment",
    ],
    difficulty: "intermediate",
    skills: ["Aviation coordination", "LZ marking"],
    bookletPage: 11,
  },
  {
    id: "afos-atgp",
    title: "Artillery Forward Observer Simulator / ATGP",
    marks: 50,
    phase: "hideout",
    category: "fires",
    purpose: "Conduct artillery shoots on simulator or area target.",
    objectives: [
      "2 individuals per team selected by umpire staff",
      "Remainder of team outside designated simulator area",
    ],
    difficulty: "advanced",
    skills: ["Fire support", "Observation"],
    bookletPage: 11,
  },
  {
    id: "ambush-drills",
    title: "Counter Ambush / Anti-Ambush",
    marks: 50,
    phase: "exfiltration",
    category: "survival",
    checkpoint: "CP 6",
    purpose: "Negotiate likely ambush sites and react when ambushed.",
    objectives: [
      "Move through likely ambush site",
      "Drills when ambushed assessed by umpires",
    ],
    difficulty: "elite",
    skills: ["Immediate action", "Fire and movement"],
    bookletPage: 12,
  },
  {
    id: "minefield-ied",
    title: "Minefield / IED Negotiation",
    marks: 50,
    phase: "infiltration",
    category: "survival",
    checkpoint: "CP 1",
    purpose: "Clear procedures through demarcated hazard areas.",
    objectives: [
      "Move through demarcated minefield or IED-prone area",
      "Drills for negotiating hazards checked",
    ],
    difficulty: "advanced",
    skills: ["EOD awareness", "Route clearance"],
    bookletPage: 12,
  },
  {
    id: "water-crossing",
    title: "Crossing of Water Gap",
    marks: 100,
    phase: "exfiltration",
    category: "survival",
    purpose: "Tactical river crossing with full fighting load.",
    objectives: [
      "40–50 m water gap with complete kit",
      "Life jackets worn by all",
      "20 min prep + 20 min crossing",
    ],
    scoring: [
      { label: "Home / far bank security", marks: 40 },
      { label: "Waterproofing packs / equipment", marks: 20 },
      { label: "Tactical crossing", marks: 40 },
    ],
    difficulty: "elite",
    skills: ["River ops", "Load waterproofing"],
    bookletPage: 12,
  },
  {
    id: "incident-site",
    title: "Incident Site",
    marks: 50,
    phase: "exfiltration",
    category: "medical",
    checkpoint: "CP 6",
    purpose: "React to chaotic incident with casualties and local population.",
    objectives: [
      "Secure incident area: 20 marks",
      "Mob control: 20 marks",
      "First aid and casualty evacuation: 10 marks",
    ],
    difficulty: "advanced",
    skills: ["Crowd control", "CASEVAC"],
    bookletPage: 13,
  },
  {
    id: "firing-smg",
    title: "Firing (SMG Only)",
    marks: 50,
    phase: "terminal",
    category: "fires",
    purpose: "Assess marksmanship under fatigue without prior zeroing.",
    objectives: [
      "2× Figure 11 targets, 100–200 m, prone without rest",
      "All 8 patrol members; 8 rounds (4 per mag) in 3 minutes",
      "Maximum 4 hits per target counted",
    ],
    rules: ["Weapons not zeroed before test — handle with due care throughout exercise"],
    difficulty: "advanced",
    skills: ["Marksmanship", "Weapon handling"],
    bookletPage: 13,
  },
  {
    id: "dealing-stranger",
    title: "Dealing with Stranger",
    marks: 50,
    phase: "infiltration",
    category: "reconnaissance",
    checkpoint: "CP 2",
    purpose: "Extract information from encountered civilian in hostile territory.",
    objectives: [
      "Conducted during infiltration or separately",
      "Gain maximum useful information; apprehension techniques tested",
    ],
    difficulty: "intermediate",
    skills: ["HUMINT", "Tactical questioning"],
    bookletPage: 13,
  },
  {
    id: "cbrn",
    title: "CBRN Test",
    marks: 100,
    phase: "exfiltration",
    category: "survival",
    checkpoint: "CP 5",
    purpose: "Respond to chemical, biological, radiological, or nuclear attack.",
    objectives: [
      "Dress to MOPP level 4",
      "Cordon area; casualty handling in CBRN environment",
      "Sampling and decontamination",
      "40 minutes per team",
    ],
    difficulty: "elite",
    skills: ["CBRN", "Decontamination"],
    bookletPage: 14,
  },
  {
    id: "speed-march",
    title: "Speed March",
    marks: 100,
    phase: "terminal",
    category: "survival",
    purpose: "Final endurance test with casualty evacuation.",
    objectives: [
      "4–5 km on defined track with 60 kg dummy casualty on stretcher",
      "Qualifying time 40 minutes",
      "1 mark penalty per extra minute",
      "Formula: (Best team time / Team time) × 100",
    ],
    difficulty: "elite",
    skills: ["Endurance", "Team carry"],
    bookletPage: 14,
  },
  {
    id: "media-handling",
    title: "Media Handling",
    marks: 50,
    phase: "exfiltration",
    category: "admin",
    purpose: "Assess team captain media engagement at incident or heli crash site.",
    objectives: [
      "Conducted at heli crash or incident site",
      "Proficiency graded by umpiring staff",
    ],
    difficulty: "intermediate",
    skills: ["Public affairs", "Command presence"],
    bookletPage: 14,
  },
  {
    id: "exfiltration-navigation",
    title: "Exfiltration / Navigation",
    marks: 150,
    phase: "exfiltration",
    category: "navigation",
    purpose: "Exfiltrate through hostile terrain on time with tactical discipline.",
    objectives: [
      "Six-figure grids at checkpoints",
      "Tactical move: 50 marks; pace 2 km/hr: 100 marks",
      "−10 points per 30 min delay at each checkpoint",
    ],
    difficulty: "elite",
    skills: ["Exfiltration", "Navigation"],
    bookletPage: 15,
  },
  {
    id: "section-assault",
    title: "Section Assault",
    marks: 50,
    phase: "exfiltration",
    category: "assault",
    checkpoint: "CP 5",
    purpose: "Clear terrorist hideout or compound; hostage rescue may be tested.",
    objectives: [
      "Target: 2–3 terrorists in hideout/compound",
      "Clear position; capture or hostage rescue as directed",
    ],
    difficulty: "elite",
    skills: ["Assault", "CQB"],
    bookletPage: 15,
  },
  {
    id: "ctr-report",
    title: "Submission of CTR Report",
    marks: 200,
    phase: "ctr",
    category: "admin",
    purpose: "Produce comprehensive intelligence report after reconnaissance.",
    objectives: [
      "1 hour writing time at next CP (not at target)",
      "Stamped blanks and butter paper issued by umpires",
    ],
    scoring: [
      { label: "Mission, situation, description", marks: 50 },
      { label: "Terrain / enemy conclusion", marks: 50 },
      { label: "Options with reasons", marks: 50 },
      { label: "Chronological description", marks: 50 },
    ],
    difficulty: "elite",
    skills: ["Reporting", "Analysis"],
    bookletPage: 15,
  },
  {
    id: "captured-terrorist",
    title: "Handling of Captured Terrorist",
    marks: 50,
    phase: "terminal",
    category: "admin",
    purpose: "Test apprehension techniques and Geneva Convention knowledge.",
    objectives: [
      "Captured terrorist handed to team",
      "Apprehension techniques and Geneva knowledge gauged",
    ],
    difficulty: "intermediate",
    skills: ["Law of armed conflict", "HUMINT"],
    bookletPage: 16,
  },
  {
    id: "terminal-kit",
    title: "Terminal Kit Inspection",
    marks: 50,
    phase: "terminal",
    category: "inspection",
    purpose: "Final verification of team load and equipment completeness.",
    objectives: [
      "Complete team inspection",
      "200 kg total including water, Harris set, batteries, trackers",
      "Equipment must be complete",
    ],
    difficulty: "foundational",
    skills: ["Load management"],
    bookletPage: 16,
  },
  {
    id: "debriefing",
    title: "Debriefing",
    marks: 100,
    phase: "terminal",
    category: "admin",
    purpose: "Team captain debrief and panel Q&A on exercise conduct.",
    objectives: [
      "30-minute time-bound captain debrief",
      "1 mark penalty per 2 minutes over",
      "Umpires assess comprehension of minutest details by all members",
    ],
    difficulty: "advanced",
    skills: ["Leadership", "After-action review"],
    bookletPage: 16,
  },
];

export const OPERATIONAL_RULES = [
  {
    id: "setting",
    title: "Operational setting",
    body: "Sub-conventional patrol into terrorist-dominated area; narrative issued to patrol leader and 2IC.",
  },
  {
    id: "tests",
    title: "Test conduct",
    body: "20–22 tests conducted independently or in combination; sequence not pre-announced.",
  },
  {
    id: "replacement",
    title: "Medical replacement",
    body: "One replacement allowed on medical grounds only: −300 points; second replacement −200 points.",
  },
  {
    id: "weight",
    title: "Weight compliance",
    body: "Random checks; −100 points per instance if team weight ≠ 200 kg.",
  },
  {
    id: "gps",
    title: "GPS prohibition",
    body: "Any GPS including watches or phones — disqualification if possessed or used.",
  },
  {
    id: "tracker",
    title: "Team tracking",
    body: "All teams issued trackers for location monitoring throughout the exercise.",
  },
  {
    id: "firing",
    title: "Terminal firing",
    body: "Firing without prior zeroing — strict weapon handling throughout.",
  },
  {
    id: "bua",
    title: "Build-up areas",
    body: "All BUAs out of bounds; no civilian assistance permitted.",
  },
  {
    id: "waste",
    title: "Field discipline",
    body: "Waste buried in team black plastic bags; shown at finish point.",
  },
  {
    id: "water",
    title: "Water safety",
    body: "No bathing or swimming in rivers/channels during movement.",
  },
  {
    id: "survival",
    title: "Survival rule",
    body: "No food resupply — teams survive on personal rations / MRE for full competition period.",
  },
] as const;

export const ORIENTATION_MODULES = [
  "Firing / zeroing (competition weapons)",
  "Navigation / map reading",
  "Signal equipment",
  "CBRN",
  "AFOS / ATGP",
  "Area orientation",
] as const;

export const GLOSSARY = {
  "E-Day": "Exercise Day",
  CP: "Check Point",
  CTR: "Close Target Reconnaissance",
  HO: "Hideout",
  QBO: "Quick Battle Orders",
  "AFOS/ATGP": "Artillery Forward Observer Simulator / Artillery Target Grid Procedure",
  CBRN: "Chemical, Biological, Radiological & Nuclear",
  MRE: "Meals Ready to Eat",
  BUA: "Build-Up Area",
} as const;

export const GALLERY_ALBUMS = [
  {
    id: "2016",
    title: "1st International PATS",
    year: 2016,
    image: "/media/pats/crops/1.jpeg",
  },
  {
    id: "2020",
    title: "3rd International PATS",
    year: 2020,
    image: "/media/pats/crops/2.jpeg",
  },
  {
    id: "2021",
    title: "4th International PATS",
    year: 2021,
    image: "/media/pats/crops/3.jpeg",
  },
  {
    id: "2022",
    title: "5th International PATS",
    year: 2022,
    image: "/media/pats/crops/4.jpeg",
  },
] as const;

export function getDrillById(id: string): TacticalDrill | undefined {
  return TACTICAL_DRILLS.find((d) => d.id === id);
}

export function getDrillsByPhase(phase: DrillPhase): TacticalDrill[] {
  return TACTICAL_DRILLS.filter((d) => d.phase === phase);
}

export const TOTAL_MARKS = TACTICAL_DRILLS.reduce((s, d) => s + d.marks, 0);
