/**
 * Public-site content captured from the local MariaDB (`pats`) dump:
 * Event, KeyDate, GalleryImage and HeroSlide.
 *
 * Rows carry their ORIGINAL cuids on purpose:
 *   - uploaded media on disk is named after the row id
 *     (`uploads/events/<id>.jpg`, `uploads/gallery/<id>.jpg`, `uploads/hero/<id>.jpg`),
 *   - `Translation.recordId` points at these ids, so regenerating them would
 *     orphan every admin-entered ru/tr/ar/zh rendering.
 *
 * Everything is an upsert by id, so re-running is safe and never duplicates.
 * Media binaries are NOT part of this seed — copy `uploads/` to the target
 * host as well, or the image/video paths below will 404.
 *
 * Called from `prisma/seed.ts` (`npm run db:seed`), or on its own with
 * `npm run db:seed:content` when only this content should be pushed.
 */
import { Prisma, PrismaClient } from "@prisma/client";

type MarkBreakdown = { label: string; marks: number };

type EventSeed = {
  id: string;
  slug: string;
  title: string;
  marks: number;
  icon: string;
  category: string;
  difficulty: string;
  duration: string;
  summary: string;
  details: string;
  participants?: string;
  breakdown?: MarkBreakdown[];
  thumbnailPath?: string;
  thumbnailMimeType?: string;
  thumbnailFileSize?: number;
  sortOrder: number;
};

export const EVENTS: EventSeed[] = [
  {
    id: "cmrixadna0000v198i57f9bhx",
    slug: "initial-kit-inspection",
    title: "Initial Kit Inspection",
    marks: 100,
    icon: "ClipboardCheck",
    category: "Inspection",
    difficulty: "Standard",
    duration: "45 min",
    summary:
      "Full team and equipment inspection with a hard 200 KG weight ceiling.",
    details:
      "Inspect the complete team and all equipment and verify that the kit is serviceable. Total team weight — including filled water bottles, Harris wireless set, batteries, weapons, ammunition and tracker — must not exceed 200 KG.",
    thumbnailPath: "events/cmrixadna0000v198i57f9bhx.jpg",
    thumbnailMimeType: "image/jpeg",
    thumbnailFileSize: 526658,
    sortOrder: 0,
  },
  {
    id: "cmrixads90001v198e67ky85n",
    slug: "report-lines",
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
    thumbnailPath: "events/cmrixads90001v198e67ky85n.jpg",
    thumbnailMimeType: "image/jpeg",
    thumbnailFileSize: 168447,
    sortOrder: 1,
  },
  {
    id: "cmrixadsq0002v198n5boi1fo",
    slug: "signal-communication",
    title: "Signal Communication",
    marks: 50,
    icon: "Radio",
    category: "Intelligence",
    difficulty: "Standard",
    duration: "30 min",
    summary:
      "Voice procedure, equipment handling and theory tested on three members.",
    details:
      "Voice procedure, handling of signal equipment, practical handling and theoretical knowledge are tested. Three participants excluding the captain are selected for assessment.",
    participants: "3 members (excluding captain)",
    thumbnailPath: "events/cmrixadsq0002v198n5boi1fo.jpg",
    thumbnailMimeType: "image/jpeg",
    thumbnailFileSize: 12772,
    sortOrder: 2,
  },
  {
    id: "cmrixadt00003v1984zpyp1jr",
    slug: "recognition-of-weapons",
    title: "Recognition of Weapons & Equipment",
    marks: 100,
    icon: "ScanSearch",
    category: "Combat",
    difficulty: "Advanced",
    duration: "30 min",
    summary:
      "Identify Chinese, Russian and NATO weapons from replicas or photographs.",
    details:
      "Recognition of Chinese, Russian and NATO weapons using replicas or photographs. Three participants excluding the captain participate in the assessment.",
    participants: "3 members (excluding captain)",
    sortOrder: 3,
  },
  {
    id: "cmrixadtd0004v198ft0gvbk8",
    slug: "verbal-orders",
    title: "Verbal Orders",
    marks: 100,
    icon: "Megaphone",
    category: "Command",
    difficulty: "Advanced",
    duration: "60 min (30 prep + 30 delivery)",
    summary:
      "Patrol leader delivers verbal orders in English with a terrain model.",
    details:
      "The patrol leader delivers verbal orders in English (the native language is also allowed). Preparation time is 30 minutes and presentation time is 30 minutes.",
    breakdown: [
      { label: "Delivery", marks: 30 },
      { label: "Contingency Planning", marks: 20 },
      { label: "Model Preparation", marks: 30 },
      { label: "Team Understanding", marks: 20 },
    ],
    sortOrder: 4,
  },
  {
    id: "cmrixadtq0005v198ctxwoiwf",
    slug: "infiltration-navigation",
    title: "Infiltration / Navigation",
    marks: 150,
    icon: "Map",
    category: "Navigation",
    difficulty: "Extreme",
    duration: "Timed",
    summary:
      "Navigate terrorist-controlled ground using six-figure grid references.",
    details:
      "Teams navigate through terrorist-controlled territory using six-figure grid references, maintaining tactical drills throughout the move.",
    breakdown: [
      { label: "Tactical drills", marks: 50 },
      { label: "Time", marks: 100 },
    ],
    sortOrder: 5,
  },
  {
    id: "cmrixadu20006v198yzod4cq2",
    slug: "occupation-of-hideout",
    title: "Occupation of Hideout",
    marks: 50,
    icon: "Tent",
    category: "Reconnaissance",
    difficulty: "Foundational",
    duration: "30 min",
    summary: "Occupy a hideout, establish defence and rehearse response drills.",
    details:
      "Teams occupy a selected hideout, establish defensive positions and perform the appropriate response drills.",
    sortOrder: 6,
  },
  {
    id: "cmrixadud0007v198im80jigd",
    slug: "close-target-reconnaissance",
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
    sortOrder: 7,
  },
  {
    id: "cmrixaduo0008v198rpxe9yzj",
    slug: "quick-battle-orders",
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
    sortOrder: 8,
  },
  {
    id: "cmrixadv00009v198mgeinmel",
    slug: "heli-crash-first-aid",
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
    sortOrder: 9,
  },
  {
    id: "cmrixadvb000av1989k8n0rtu",
    slug: "landing-zone-selection",
    title: "Landing Zone Selection",
    marks: 50,
    icon: "PlaneLanding",
    category: "Reconnaissance",
    difficulty: "Standard",
    duration: "30 min",
    summary: "Select, mark and secure a helicopter landing zone near the base.",
    details:
      "Select and mark a helicopter landing zone near the patrol base. Securing the landing zone and correctly signalling helicopters are evaluated.",
    sortOrder: 10,
  },
  {
    id: "cmrixadvm000bv198kvet6a0k",
    slug: "afos-atgp-simulator",
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
    sortOrder: 11,
  },
  {
    id: "cmrixadvx000cv1984x8zr459",
    slug: "counter-ambush",
    title: "Counter Ambush",
    marks: 50,
    icon: "ShieldAlert",
    category: "Combat",
    difficulty: "Advanced",
    duration: "20 min",
    summary: "React to an ambush and execute counter-ambush drills.",
    details:
      "Drills, reactions and tactical procedures are evaluated while the team negotiates an ambush site.",
    sortOrder: 12,
  },
  {
    id: "cmrixadw8000dv198zpzsuz86",
    slug: "minefield-ied-negotiation",
    title: "Minefield / IED Negotiation",
    marks: 50,
    icon: "Bomb",
    category: "Navigation",
    difficulty: "Advanced",
    duration: "30 min",
    summary: "Negotiate mine and IED prone areas with correct procedures.",
    details:
      "Teams negotiate minefields and improvised explosive device prone areas using proper tactical procedures.",
    sortOrder: 13,
  },
  {
    id: "cmrixadwi000ev1982f50hg5a",
    slug: "water-crossing",
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
    sortOrder: 14,
  },
  {
    id: "cmrixadwt000fv198p84mp3xo",
    slug: "incident-site",
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
    sortOrder: 15,
  },
  {
    id: "cmrixadx3000gv1987f9xihfd",
    slug: "firing",
    title: "Firing",
    marks: 50,
    icon: "Crosshair",
    category: "Combat",
    difficulty: "Standard",
    duration: "3 min serial",
    summary: "Engage figure targets with SMG at 100–200 m — 8 rounds, 3 minutes.",
    details:
      "Fire using SMGs at figure targets from 100–200 metres while lying down. Eight bullets are fired within three minutes.",
    sortOrder: 16,
  },
  {
    id: "cmrixadxe000hv198znulaxib",
    slug: "dealing-with-stranger",
    title: "Dealing with Stranger",
    marks: 50,
    icon: "UserSearch",
    category: "Intelligence",
    difficulty: "Foundational",
    duration: "20 min",
    summary:
      "Gather intelligence from civilians while keeping operational security.",
    details:
      "Gather intelligence from civilians while maintaining operational security. Apprehension techniques are assessed.",
    sortOrder: 17,
  },
  {
    id: "cmrixadxo000iv19839zjxqdn",
    slug: "cbrn-test",
    title: "CBRN Test",
    marks: 100,
    icon: "Biohazard",
    category: "Medical",
    difficulty: "Extreme",
    duration: "45 min",
    summary: "Respond to a chemical attack in MOPP Level 4 kit.",
    details:
      "Respond to a chemical attack scenario using MOPP Level 4 equipment. Perform casualty handling, decontamination and sampling.",
    sortOrder: 18,
  },
  {
    id: "cmrixadxw000jv198gwv5sine",
    slug: "speed-march",
    title: "Speed March",
    marks: 100,
    icon: "Footprints",
    category: "Navigation",
    difficulty: "Extreme",
    duration: "40 min qualifying",
    summary: "Cover 4–5 km carrying a 60 KG dummy casualty; 40 min to qualify.",
    details:
      "Cover 4–5 KM while carrying a 60 KG dummy casualty. The qualifying time is 40 minutes and penalties apply for delays.",
    sortOrder: 19,
  },
  {
    id: "cmrixady7000kv198ed0hm1n0",
    slug: "media-handling",
    title: "Media Handling",
    marks: 50,
    icon: "Mic",
    category: "Command",
    difficulty: "Standard",
    duration: "15 min",
    summary: "Captain's media interaction and communication skills assessed.",
    details:
      "The captain's media interaction and communication skills are evaluated in a simulated press engagement.",
    sortOrder: 20,
  },
  {
    id: "cmrixadyh000lv198mdehxmyc",
    slug: "exfiltration-navigation",
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
    sortOrder: 21,
  },
  {
    id: "cmrixadyr000mv198ww7vnh68",
    slug: "section-assault",
    title: "Section Assault",
    marks: 50,
    icon: "Swords",
    category: "Combat",
    difficulty: "Extreme",
    duration: "30 min",
    summary: "Clear a terrorist hideout or compound; hostage rescue possible.",
    details:
      "Clear a terrorist hideout or compound. Hostage rescue may also be assessed as part of the serial.",
    sortOrder: 22,
  },
  {
    id: "cmrixadz2000nv198jn8qd92e",
    slug: "ctr-report",
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
    sortOrder: 23,
  },
  {
    id: "cmrixadzb000ov198f1v62i9p",
    slug: "handling-captured-terrorist",
    title: "Handling of Captured Terrorist",
    marks: 50,
    icon: "Lock",
    category: "Intelligence",
    difficulty: "Standard",
    duration: "20 min",
    summary: "Apprehension technique and Geneva Convention knowledge assessed.",
    details:
      "Apprehension techniques and knowledge of the Geneva Convention are assessed during handling of a captured terrorist.",
    sortOrder: 24,
  },
  {
    id: "cmrixadzn000pv198hbrmy6br",
    slug: "terminal-kit-inspection",
    title: "Terminal Kit Inspection",
    marks: 50,
    icon: "ClipboardList",
    category: "Inspection",
    difficulty: "Foundational",
    duration: "30 min",
    summary: "Final equipment inspection and verification of the 200 KG weight.",
    details:
      "Final inspection of the complete equipment and verification of the total team weight (200 KG).",
    sortOrder: 25,
  },
  {
    id: "cmrixadzw000qv1981bbkco3x",
    slug: "debriefing",
    title: "Debriefing",
    marks: 100,
    icon: "Presentation",
    category: "Command",
    difficulty: "Advanced",
    duration: "30 min",
    summary: "Captain presents the exercise summary; umpires question the team.",
    details:
      "The captain presents a complete exercise summary followed by questions from the umpires. The time limit is 30 minutes with penalties for exceeding it.",
    sortOrder: 26,
  },
];

export const KEY_DATES = [
  {
    id: "cmqzebk9z000iv180boha8zuy",
    label: "MPC",
    value: "October 2026",
    date: new Date("2026-01-15T00:00:00.000Z"),
    sortOrder: 0,
  },
  {
    id: "cmqzebk9z000jv180x07c5l8a",
    label: "Opening date for applications",
    value: "October 2026",
    date: new Date("2026-02-27T00:00:00.000Z"),
    sortOrder: 1,
  },
  {
    id: "cmqzebk9z000kv180nuqpql23",
    label: "Closing dates",
    value: "15 November 2026",
    date: null,
    sortOrder: 2,
  },
  {
    id: "cmqzebk9z000lv180pcq62r18",
    label: "Participation (incl phase) confirmed by",
    value: "21 November 2026",
    date: null,
    sortOrder: 3,
  },
];

export const GALLERY_IMAGES = [
  {
    id: "cmrsrca0g0000v1d4qiwmf4pw",
    title: "Awards",
    caption: null,
    year: 2026,
    category: "Awards & Recognition",
    mediaType: "image",
    imagePath: "gallery/cmrsrca0g0000v1d4qiwmf4pw.jpg",
    imageMimeType: "image/jpeg",
    imageFileSize: 6363430,
    posterPath: null,
    posterMimeType: null,
    posterFileSize: null,
    sortOrder: 0,
  },
  {
    id: "cmrsrhkf30001v1d4gahr4ac4",
    title: "Traning",
    caption: null,
    year: 2026,
    category: "Training Activities",
    mediaType: "image",
    imagePath: "gallery/cmrsrhkf30001v1d4gahr4ac4.jpg",
    imageMimeType: "image/jpeg",
    imageFileSize: 526658,
    posterPath: null,
    posterMimeType: null,
    posterFileSize: null,
    sortOrder: 0,
  },
  {
    id: "cmru7pjgd0000v110jh760ho8",
    title: "5th International PATS",
    caption: null,
    year: 2026,
    category: "Competition Events",
    mediaType: "video",
    imagePath: "gallery/cmru7pjgd0000v110jh760ho8.mp4",
    imageMimeType: "video/mp4",
    imageFileSize: 28917521,
    posterPath: "gallery/cmru7pjgd0000v110jh760ho8-poster.jpg",
    posterMimeType: "image/jpeg",
    posterFileSize: 3582792,
    sortOrder: 0,
  },
];

export const HERO_SLIDES = [
  {
    id: "cmrstd9ay0001v1ssxt42n03i",
    title: "Team briefing — first light",
    alt: null,
    imagePath: "hero/cmrstd9ay0001v1ssxt42n03i.jpg",
    imageMimeType: "image/jpeg",
    imageFileSize: 451938,
    sortOrder: 1,
  },
  {
    id: "cmrstd9d10003v1sse7b5758u",
    title: "Night navigation stand",
    alt: null,
    imagePath: "hero/cmrstd9d10003v1sse7b5758u.jpg",
    imageMimeType: "image/jpeg",
    imageFileSize: 309752,
    sortOrder: 3,
  },
  {
    id: "cmrsvizsv0014v1fojtlapwrl",
    title: "xyz",
    alt: null,
    imagePath: "hero/cmrsvizsv0014v1fojtlapwrl.jpg",
    imageMimeType: "image/jpeg",
    imageFileSize: 3627281,
    sortOrder: 3,
  },
];

/** Upserts the public-site content above. Idempotent; never deletes. */
export async function seedContent(prisma: PrismaClient) {
  for (const event of EVENTS) {
    const { id, breakdown, ...rest } = event;
    const data = {
      ...rest,
      participants: rest.participants ?? null,
      thumbnailPath: rest.thumbnailPath ?? null,
      thumbnailMimeType: rest.thumbnailMimeType ?? null,
      thumbnailFileSize: rest.thumbnailFileSize ?? null,
      breakdown: breakdown ?? Prisma.DbNull,
      published: true,
    };
    await prisma.event.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  for (const keyDate of KEY_DATES) {
    const { id, ...data } = keyDate;
    await prisma.keyDate.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  for (const image of GALLERY_IMAGES) {
    const { id, ...data } = image;
    await prisma.galleryImage.upsert({
      where: { id },
      update: { ...data, published: true },
      create: { id, ...data, published: true },
    });
  }

  for (const slide of HERO_SLIDES) {
    const { id, ...data } = slide;
    await prisma.heroSlide.upsert({
      where: { id },
      update: { ...data, published: true },
      create: { id, ...data, published: true },
    });
  }

  console.log(
    `Content seed: ${EVENTS.length} events, ${KEY_DATES.length} key dates, ` +
      `${GALLERY_IMAGES.length} gallery items, ${HERO_SLIDES.length} hero slides.`
  );
}

/** `npm run db:seed:content` — content only, no users/news/ticker changes. */
if (require.main === module) {
  const client = new PrismaClient();
  seedContent(client)
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await client.$disconnect();
    });
}
