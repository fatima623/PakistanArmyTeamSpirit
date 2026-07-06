"use client";

import { DrillCard } from "@/components/operations/DrillCard";
import { ForestCardGrid } from "@/components/pats/ForestCardGrid";
import type { TacticalDrill } from "@/lib/pats-content";

type Props = {
  drills: TacticalDrill[];
};

/** Homepage mission pillars — single-row grid (no carousel). */
export function MissionPillarTrack({ drills }: Props) {
  if (drills.length === 0) return null;

  return (
    <ForestCardGrid
      ariaLabel="Competition operational pillars"
      columns={4}
    >
      {drills.map((drill, i) => (
        <DrillCard key={drill.id} drill={drill} index={i} variant="pillar" />
      ))}
    </ForestCardGrid>
  );
}
