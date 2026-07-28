import type { Metadata } from "next";

import { AwardsResultsRoll } from "@/components/awards/AwardsResultsRoll";
import { AwardsShowcase } from "@/components/awards/AwardsShowcase";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getAwardsRoll } from "@/lib/awards";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.awards };
}

export default async function AwardsPage() {
  const { t } = await getDictionary();
  const p = t.publicSite.pages.awards;
  const roll = await getAwardsRoll();

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
        {roll.rows.length > 0 && (
          <AwardsResultsRoll rows={roll.rows} year={roll.year} />
        )}
      </PatsSection>

    </div>
  );
}
