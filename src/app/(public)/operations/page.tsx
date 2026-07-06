import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { DrillCard } from "@/components/operations/DrillCard";
import { ForestCardCarousel } from "@/components/pats/ForestCardCarousel";
import { OperationalMap } from "@/components/operations/OperationalMap";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import {
  OPERATIONAL_RULES,
  OVERVIEW,
  TACTICAL_DRILLS,
  TOTAL_MARKS,
} from "@/lib/pats-content";

export const metadata: Metadata = {
  title: "Operations",
  description:
    "Tactical drills, checkpoints, and scoring for the PATS competition.",
};

const PHASES = [
  { id: "preparation", label: "Preparation" },
  { id: "infiltration", label: "Infiltration" },
  { id: "hideout", label: "Hideout" },
  { id: "ctr", label: "Close target reconnaissance" },
  { id: "exfiltration", label: "Exfiltration" },
  { id: "terminal", label: "Terminal phase" },
] as const;

export default function OperationsPage() {
  return (
    <div className="space-y-0">
      <PatsPageHero
        eyebrow="Mission selection"
        title="Operations"
        subtitle="Select a tactical event. Each mission brief includes objectives, scoring matrix, and operational phase alignment."
        meta={[
          { label: "Events", value: String(TACTICAL_DRILLS.length) },
          { label: "Total marks", value: TOTAL_MARKS.toLocaleString() },
          { label: "Duration", value: "60 hours" },
        ]}
      />

      <PatsSection variant="navy">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="Mission"
            title="Operational overview"
            description={OVERVIEW.lead}
          />
        </ScrollReveal>
        <div className="pats-highlight-grid pats-highlight-grid--5 mt-8 items-stretch">
          {OVERVIEW.highlights.map((h) => (
            <div key={h.label} className="pats-highlight-cell">
              <p className="pats-highlight-cell__label">{h.label}</p>
              <p className="pats-highlight-cell__value">{h.value}</p>
            </div>
          ))}
        </div>
        <p className="pats-body mt-6">
          {TACTICAL_DRILLS.length} scored events · {TOTAL_MARKS.toLocaleString()}{" "}
          total marks across the exercise
        </p>
      </PatsSection>

      <PatsSection variant="elevated">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="Route"
            title="Layout of events"
            description="Checkpoint sequence from assembly through infiltration, CTR, and exfiltration."
          />
        </ScrollReveal>
        <ScrollReveal className="mt-8">
          <OperationalMap />
        </ScrollReveal>
      </PatsSection>

      {PHASES.map((phase) => {
        const drills = TACTICAL_DRILLS.filter((d) => d.phase === phase.id);
        if (drills.length === 0) return null;
        return (
          <PatsSection key={phase.id} variant="deepest">
            <ScrollReveal>
              <PatsSectionHeading
                eyebrow={phase.label}
                title={phase.label}
                description={`${drills.length} evaluated ${
                  drills.length === 1 ? "event" : "events"
                } in this phase.`}
              />
            </ScrollReveal>
            <div className="mt-8">
              <ForestCardCarousel
                ariaLabel={`${phase.label} competition events`}
                autoPlayMs={0}
              >
                {drills.map((drill, i) => (
                  <DrillCard key={drill.id} drill={drill} index={i} />
                ))}
              </ForestCardCarousel>
            </div>
          </PatsSection>
        );
      })}

      <PatsSection variant="dark">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="Rules"
            title="Coordinating points"
            description="Operational notices and penalties — failure to comply may result in disqualification."
          />
        </ScrollReveal>
        <div className="pats-rules-grid mt-8 grid gap-3 md:grid-cols-2">
          {OPERATIONAL_RULES.map((rule) => (
            <div
              key={rule.id}
              className={
                "severity" in rule && rule.severity === "critical"
                  ? "pats-rule-card pats-rule-card--critical"
                  : "pats-rule-card"
              }
            >
              <h3>{rule.title}</h3>
              <p className="pats-body mt-1.5">{rule.body}</p>
            </div>
          ))}
        </div>
      </PatsSection>
    </div>
  );
}
