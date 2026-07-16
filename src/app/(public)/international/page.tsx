import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { RegisteredNationsMap } from "@/components/international/RegisteredNationsMap";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "International Participation",
};

export default async function InternationalPage() {
  const { t } = await getDictionary();
  const p = t.publicSite.pages.international;

  return (
    <div className="space-y-0">
      <PatsPageHero
        eyebrow={p.heroEyebrow}
        title={p.heroTitle}
        subtitle={p.heroSubtitle}
        meta={[
          { label: p.metaSince, value: p.metaSinceValue },
          { label: p.metaEditions, value: p.metaEditionsValue },
          { label: p.metaReach, value: p.metaReachValue },
        ]}
      />

      <PatsSection variant="navy">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={p.mapEyebrow}
            title={p.mapTitle}
            description={p.mapDescription}
          />
        </ScrollReveal>
        <ScrollReveal className="mt-8">
          <RegisteredNationsMap />
        </ScrollReveal>
      </PatsSection>

      <PatsSection variant="deepest">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={p.orientationEyebrow}
            title={p.orientationTitle}
            description={p.orientationDescription}
          />
        </ScrollReveal>
        <div className="pats-orientation-grid mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {p.orientationModules.map((mod) => (
            <div key={mod} className="pats-panel pats-panel--tile">
              <p className="pats-panel__label">{mod}</p>
            </div>
          ))}
        </div>
        <div className="pats-body mt-8 max-w-3xl space-y-4">
          {p.historyNarrative.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </PatsSection>
    </div>
  );
}
