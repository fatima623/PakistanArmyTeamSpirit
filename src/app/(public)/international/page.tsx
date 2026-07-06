import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { NationsWall } from "@/components/international/NationsWall";
import { ParticipationTimeline } from "@/components/international/ParticipationTimeline";
import { WorldMapPanel } from "@/components/international/WorldMapPanel";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { HISTORY, ORIENTATION_MODULES } from "@/lib/pats-content";
import { INTERNATIONAL_TEAMS } from "@/lib/pats-public";

export const metadata: Metadata = {
  title: "International Participation",
};

export default function InternationalPage() {
  return (
    <div className="space-y-0">
      <PatsPageHero
        eyebrow="Global partnerships"
        title="International participation"
        subtitle={INTERNATIONAL_TEAMS.description}
        meta={[
          { label: "Since", value: "2016" },
          { label: "Editions", value: "8 international" },
          { label: "Scope", value: "Multi-theatre" },
        ]}
      />

      <PatsSection variant="navy">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="Theatre map"
            title="Partner nations"
            description="Friendly forces represented across successive international editions."
          />
        </ScrollReveal>
        <ScrollReveal className="mt-8">
          <WorldMapPanel />
        </ScrollReveal>
        <ScrollReveal className="mt-10">
          <NationsWall />
        </ScrollReveal>
      </PatsSection>

      <PatsSection variant="elevated">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="History"
            title="Edition timeline"
            description={`International PATS since ${HISTORY.internationalSince}. ${HISTORY.editionsHeld} international editions conducted to date.`}
          />
        </ScrollReveal>
        <div className="mt-8">
          <ParticipationTimeline />
        </div>
      </PatsSection>

      <PatsSection variant="deepest">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="Orientation"
            title="Familiarization training"
            description="International teams are attached to a local unit for acclimatization before exercise start."
          />
        </ScrollReveal>
        <div className="pats-orientation-grid mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ORIENTATION_MODULES.map((mod) => (
            <div key={mod} className="pats-panel pats-panel--tile">
              <p className="pats-panel__label">{mod}</p>
            </div>
          ))}
        </div>
        <div className="pats-body mt-8 max-w-3xl space-y-4">
          {HISTORY.narrative.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </PatsSection>
    </div>
  );
}
