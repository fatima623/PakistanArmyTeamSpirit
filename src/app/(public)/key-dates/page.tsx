import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import {
  getTranslations,
} from "@/lib/i18n/content-translations";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  translateKeyDateLabel,
  translateKeyDateValue,
} from "@/lib/i18n/key-date-i18n";
import { getKeyDates } from "@/lib/site-data";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.keyDates };
}

export default async function KeyDatesPage() {
  const [keyDates, { t, locale }] = await Promise.all([
    getKeyDates(),
    getDictionary(),
  ]);
  const p = t.publicSite.pages.keyDates;

  // THE FALLBACK CHAIN, per field:
  //   1. an admin-entered DB translation (deliberate, so it wins);
  //   2. the static key-date-i18n lookup — still authoritative for the known
  //      milestone labels and for swapping English month names inside a value;
  //   3. the English source.
  // `getTranslations` already drops blank values, so `??` lands on tier 2
  // whenever a field is untranslated, and tier 2 itself falls back to English.
  // Translated outside site-data's unstable_cache, which is not locale-keyed.
  const translations = await getTranslations(
    "KeyDate",
    keyDates.map((kd) => kd.id),
    locale
  );
  const rows = keyDates.map((kd) => {
    const tr = translations.get(kd.id);
    return {
      id: kd.id,
      label: tr?.label ?? translateKeyDateLabel(kd.label, locale),
      value: tr?.value ?? translateKeyDateValue(kd.value, locale),
    };
  });

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
            {rows.length === 0 ? (
              <p className="pats-body p-6">{p.empty}</p>
            ) : (
              rows.map((kd) => (
                <div
                  key={kd.id}
                  className="pats-data-table__row pats-data-table__row--split"
                >
                  <div className="pats-data-table__label">{kd.label}</div>
                  <div className="pats-data-table__value">{kd.value}</div>
                </div>
              ))
            )}
          </div>
        </ScrollReveal>
      </PatsSection>
    </>
  );
}
