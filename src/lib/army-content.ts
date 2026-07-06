/**
 * Homepage marketing sections — copy from official PATS booklet (MEDIA PATS).
 * Uses processed crops plus selected official MEDIA PATS source imagery.
 */

import registerCard33 from "../../MEDIA PATS/33.webp";
import aboutFeature35 from "../../MEDIA PATS/35.webp";
import internationalCard36 from "../../MEDIA PATS/36.webp";
import operationsCard37 from "../../MEDIA PATS/37.jpg";
import {
  OVERVIEW,
  PATS_ESSENCE,
  PATS_MOTTO,
} from "@/lib/pats-content";

export const ARMY_STATS = [
  { value: 60, suffix: " HRS", label: "Patrol exercise duration" },
  { value: 8, suffix: "", label: "Stations" },
  { value: 22, suffix: "+", label: "Tactical tests" },
  { value: 33, suffix: "", label: "Scored tasks" },
] as const;

export const PATS_PILLARS = [
  {
    title: "Team spirit",
    subtitle: PATS_ESSENCE,
    description:
      "Patrol cohesion under stress — mutual support, shared load, and collective focus through every checkpoint.",
    icon: "eagle",
  },
  {
    title: "Tactical mastery",
    subtitle: "20–22 tests",
    description:
      "Navigation, CTR, CBRN, assault, medical, fires, and endurance events scored across the operational box.",
    icon: "sword",
  },
  {
    title: "Endurance",
    subtitle: "60-hour patrol",
    description:
      "Continuous movement through a 30×30 km area, 50–60 km traverse, with no scheduled rest during the exercise.",
    icon: "shield",
  },
  {
    title: "International PATS",
    subtitle: "Since 2016",
    description:
      "Partner-nation patrols share lessons in sub-conventional patrolling, orientation, and competition standards.",
    icon: "star",
  },
] as const;

export const CAREER_TRACKS = [
  {
    id: "register",
    title: "Register your team",
    tag: "Participation",
    description:
      "Submit roster, unit details, and liaison information through the official portal.",
    href: "/event/register",
    image: registerCard33.src,
  },
  {
    id: "operations",
    title: "Operations brief",
    tag: "Scored events",
    description:
      "Layout of events, conduct of competition, and marks for every tactical module.",
    href: "/operations",
    image: operationsCard37.src,
  },
  {
    id: "international",
    title: "International editions",
    tag: "Partner nations",
    description:
      "Edition timeline, participating countries, and familiarization before exercise start.",
    href: "/international",
    image: internationalCard36.src,
    imageFit: "contain",
    imagePosition: "center center",
    imageRepeat: "no-repeat",
  },
] as const;

export const MISSION_QUOTE = PATS_ESSENCE.toUpperCase();

export const MISSION_BODY = `${OVERVIEW.lead} ${OVERVIEW.body[1]} ${OVERVIEW.body[2]}`;

export const MISSION_MOTTO = PATS_MOTTO;

/** Homepage mission triptych — soldier portrait slot (replace when final asset is ready). */
export const MISSION_SOLDIER_PLACEHOLDER = operationsCard37.src;

export const ABOUT_FEATURE_IMAGE = aboutFeature35.src;
