import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { AwardsShowcase } from "@/components/awards/AwardsShowcase";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.awards };
}

export default async function AwardsPage() {
  const { t } = await getDictionary();
  const p = t.publicSite.pages.awards;

  return (
    <div className="space-y-0">
      <PatsPageHero
        eyebrow={p.heroEyebrow}
        title={p.heroTitle}
        subtitle={p.heroSubtitle}
        meta={[
          { label: p.metaGold, value: "≥ 75%" },
          { label: p.metaSilver, value: "65–74.99%" },
          { label: p.metaBronze, value: "55–64.99%" },
        ]}
      />

      <PatsSection variant="navy" className="pats-awards-page-section">
        <AwardsShowcase />
      </PatsSection>

      <PatsSection variant="elevated" className="pats-awards-page-section">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={p.teamEyebrow}
            title={p.teamTitle}
            description={p.teamDescription}
          />
        </ScrollReveal>
        <div className="pats-awards-team-card">
          <div className="pats-data-table">
            {p.teamRoles.map((row) => (
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
