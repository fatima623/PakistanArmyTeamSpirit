import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { AwardsShowcase } from "@/components/awards/AwardsShowcase";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { TEAM_ROLES } from "@/lib/pats-content";

export const metadata: Metadata = {
  title: "Awards & Recognition",
};

export default function AwardsPage() {
  return (
    <div className="space-y-0">
      <PatsPageHero
        eyebrow="Honors registry"
        title="Awards & recognition"
        subtitle="Teams are graded across all tactical events. Overall percentage determines medal tier and certificate of participation."
        meta={[
          { label: "Gold", value: "≥ 75%" },
          { label: "Silver", value: "65–74.99%" },
          { label: "Bronze", value: "55–64.99%" },
        ]}
      />

      <PatsSection variant="navy" className="pats-awards-page-section">
        <AwardsShowcase />
      </PatsSection>

      <PatsSection variant="elevated" className="pats-awards-page-section">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="Team"
            title="Team composition"
            description="Official patrol structure for competition teams."
          />
        </ScrollReveal>
        <div className="pats-awards-team-card">
          <div className="pats-data-table">
            {TEAM_ROLES.map((row) => (
              <div
                key={row.role}
                className="pats-data-table__row pats-data-table__row--split"
              >
                <div className="pats-data-table__label">{row.role}</div>
                <div className="pats-data-table__value">{row.qty}</div>
              </div>
            ))}
          </div>
        </div>
      </PatsSection>
    </div>
  );
}
