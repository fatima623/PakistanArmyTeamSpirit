import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  translateKeyDateLabel,
  translateKeyDateValue,
} from "@/lib/i18n/key-date-i18n";
import { getKeyDates } from "@/lib/site-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Key Dates",
};

export default async function KeyDatesPage() {
  const [keyDates, { t, locale }] = await Promise.all([
    getKeyDates(),
    getDictionary(),
  ]);
  const p = t.publicSite.pages.keyDates;

  return (
    <>
      <PatsPageHero
        eyebrow={p.heroEyebrow}
        title={p.heroTitle}
        subtitle={p.heroSubtitle}
      />
      <PatsSection variant="navy">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={p.sectionEyebrow}
            title={p.sectionTitle}
            description={p.sectionDescription}
          />
        </ScrollReveal>
        <ScrollReveal className="mt-8">
          <div className="pats-data-table">
            {keyDates.length === 0 ? (
              <p className="pats-body p-6">{p.empty}</p>
            ) : (
              keyDates.map((kd) => (
                <div
                  key={kd.id}
                  className="pats-data-table__row pats-data-table__row--split"
                >
                  <div className="pats-data-table__label">
                    {translateKeyDateLabel(kd.label, locale)}
                  </div>
                  <div className="pats-data-table__value">
                    {translateKeyDateValue(kd.value, locale)}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollReveal>
      </PatsSection>
    </>
  );
}
