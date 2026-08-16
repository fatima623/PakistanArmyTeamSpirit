import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { RegisteredNationsMap } from "@/components/international/RegisteredNationsMap";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.international };
}

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

      {/* Familiarization training used to sit here; it now lives with the rest
          of the pre-arrival brief on /familiarization. The edition timeline that
          followed the map has been retired. */}
    </div>
  );
}
