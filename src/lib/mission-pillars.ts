import type { DrillCategory } from "@/lib/pats-content";

export type MissionPillarMeta = {
  pillar: string;
  skillset: string;
  grid: string;
};

export const CATEGORY_PILLAR_META: Record<DrillCategory, MissionPillarMeta> = {
  inspection: {
    pillar: "Physical readiness",
    skillset: "DISCIPLINE",
    grid: "ZONE-A",
  },
  communications: {
    pillar: "Tactical communications",
    skillset: "COORDINATION",
    grid: "ZONE-C",
  },
  navigation: {
    pillar: "Night combat navigation",
    skillset: "ENDURANCE",
    grid: "ZONE-N",
  },
  reconnaissance: {
    pillar: "Tactical reconnaissance",
    skillset: "SURVEILLANCE",
    grid: "ZONE-R",
  },
  medical: {
    pillar: "Combat medical response",
    skillset: "CASUALTY CARE",
    grid: "ZONE-M",
  },
  fires: {
    pillar: "Sniper & fires operations",
    skillset: "PRECISION",
    grid: "ZONE-F",
  },
  assault: {
    pillar: "Tactical maneuvers",
    skillset: "ASSAULT",
    grid: "ZONE-B",
  },
  survival: {
    pillar: "Physical agility & survival",
    skillset: "ENDURANCE",
    grid: "ZONE-S",
  },
  admin: {
    pillar: "Operational administration",
    skillset: "COMMAND",
    grid: "ZONE-HQ",
  },
};
