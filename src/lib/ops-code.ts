import type { TacticalDrill } from "@/lib/pats-content";

const PHASE_PREFIX: Record<TacticalDrill["phase"], string> = {
  preparation: "PREP",
  infiltration: "INF",
  hideout: "HO",
  ctr: "CTR",
  exfiltration: "EXF",
  terminal: "TER",
};

/** Mission-style operation code for UI (e.g. PATS-INF-07) */
export function operationCode(drill: TacticalDrill, index: number): string {
  const prefix = PHASE_PREFIX[drill.phase];
  const num = String(index + 1).padStart(2, "0");
  return `PATS-${prefix}-${num}`;
}
