"use client";

import { HeroSlider } from "@/components/army/HeroSlider";
import type { HeroImage } from "@/components/hero/PatsHero";
import { ScrollReveal } from "@/components/army/ScrollReveal";
import { StatsBar } from "@/components/army/StatsBar";
import { PatsMissionShowcase } from "@/components/pats/PatsMissionShowcase";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  translateKeyDateLabel,
  translateKeyDateValue,
} from "@/lib/i18n/key-date-i18n";
import type { PublicSiteSettings } from "@/lib/site-data";

type KeyDateRow = { id: string; label: string; value: string };

type Props = {
  settings: PublicSiteSettings;
  keyDates: KeyDateRow[];
  heroSlides?: HeroImage[];
};

export function HomeArmy({ settings, keyDates, heroSlides }: Props) {
  const { t, locale, dir } = useI18n();
  const previewDates = keyDates.slice(0, 4);

  return (
    <div className="army-home scroll-deck" lang={locale} dir={dir}>
      <div className="scroll-deck__hero">
        <HeroSlider
          exerciseYear={settings.exerciseYear}
          slides={heroSlides}
        />
      </div>

      <StatsBar className="scroll-deck-layer--first" />

      <PatsSection
        id="mission"
        variant="mission"
        className="pats-section--mission-showcase"
      >
        <PatsMissionShowcase
          eyebrow={t.home.mission.eyebrow}
          quote={t.home.mission.quote}
          body={t.home.mission.body}
          motto={t.home.hero.motto}
          mottoUrdu={locale === "en"}
          imageAlt={t.home.mission.imageAlt}
        />
      </PatsSection>

      {previewDates.length > 0 && (
        <PatsSection id="dates" variant="dark">
          <ScrollReveal className="mx-auto w-full max-w-3xl">
            <PatsSectionHeading
              eyebrow={t.home.dates.eyebrow}
              title={t.home.dates.title}
              align="center"
            />
            <ul className="pats-home-schedule mt-8 divide-y divide-[var(--lt-divider,var(--pats-border))] overflow-hidden">
              {previewDates.map((kd) => (
                <li
                  key={kd.id}
                  className="pats-home-schedule__row grid gap-2 px-4 py-4 transition-colors sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-6 sm:px-6"
                >
                  <span className="pats-schedule-label pats-type-eyebrow uppercase tracking-[0.14em]">
                    {translateKeyDateLabel(kd.label, locale)}
                  </span>
                  <span className="pats-schedule-value pats-type-body">
                    {translateKeyDateValue(kd.value, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </PatsSection>
      )}
    </div>
  );
}
