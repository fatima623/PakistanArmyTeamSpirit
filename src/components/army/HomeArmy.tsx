"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroSlider } from "@/components/army/HeroSlider";
import type { HeroImage } from "@/components/hero/PatsHero";
import { ScrollReveal } from "@/components/army/ScrollReveal";
import { StatsBar } from "@/components/army/StatsBar";
import { PatsImageGrid } from "@/components/pats/PatsImageGrid";
import { PatsMissionShowcase } from "@/components/pats/PatsMissionShowcase";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { ABOUT_FEATURE_IMAGE, CAREER_TRACKS } from "@/lib/army-content";
import { PATS_CROP } from "@/lib/media";
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

  const careerCards = CAREER_TRACKS.map((c) => ({
    id: c.id,
    href: c.href,
    image: c.image,
    tag: t.home.careers.cards[c.id].tag,
    title: t.home.careers.cards[c.id].title,
    imageFit: "imageFit" in c ? c.imageFit : undefined,
    imagePosition: "imagePosition" in c ? c.imagePosition : undefined,
    imageRepeat: "imageRepeat" in c ? c.imageRepeat : undefined,
  }));

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

      <PatsSection
        id="careers"
        variant="light"
        backgroundImage={PATS_CROP.photo28}
        backgroundFit="contain"
      >
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={t.home.careers.eyebrow}
            title={t.home.careers.title}
            description={t.home.careers.description}
          />
        </ScrollReveal>
        <div
          className="mt-10"
          style={{
            position: "relative",
            isolation: "isolate",
            overflow: "visible",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <PatsImageGrid cards={careerCards} />
        </div>
      </PatsSection>

      <PatsSection variant="dark">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <ScrollReveal>
            <PatsSectionHeading
              eyebrow={t.home.about.eyebrow}
              title={t.home.about.title}
              description={t.home.about.lead}
            />
            <ul className="pats-body mt-6 space-y-3">
              {t.home.about.points.map((p) => (
                <li
                  key={p.title}
                  className="border-l-2 border-[var(--pats-gold)]/50 pl-4"
                >
                  <strong className="pats-feature-title text-[var(--pats-white)]">
                    {p.title}
                  </strong>
                  <span className="pats-body mt-1 block opacity-90">{p.body}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <div className="pats-home-feature-image relative aspect-[4/3] overflow-hidden border border-[var(--pats-border-gold)]">
              <Image
                src={ABOUT_FEATURE_IMAGE}
                alt={t.home.about.imageAlt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </ScrollReveal>
        </div>
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
            <div className="mt-6 text-center">
              <Link href="/key-dates" className="pats-btn">
                {t.home.dates.fullSchedule}
              </Link>
            </div>
          </ScrollReveal>
        </PatsSection>
      )}
    </div>
  );
}
