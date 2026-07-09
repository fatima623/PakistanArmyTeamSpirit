"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroSlider } from "@/components/army/HeroSlider";
import { ScrollReveal } from "@/components/army/ScrollReveal";
import { StatsBar } from "@/components/army/StatsBar";
import { PatsImageGrid } from "@/components/pats/PatsImageGrid";
import { PatsMissionShowcase } from "@/components/pats/PatsMissionShowcase";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { PatsVideoGallery } from "@/components/pats/PatsVideoGallery";
import { MissionPillarTrack } from "@/components/operations/MissionPillarTrack";
import {
  ABOUT_FEATURE_IMAGE,
  CAREER_TRACKS,
  MISSION_BODY,
  MISSION_MOTTO,
  MISSION_QUOTE,
} from "@/lib/army-content";
import { PATS_HOME_VIDEOS } from "@/lib/pats-home-content";
import { ABOUT_PATS, REGISTRATION_INFO } from "@/lib/pats-public";
import { TACTICAL_DRILLS } from "@/lib/pats-content";
import { PATS_CROP } from "@/lib/media";
import type { PublicSiteSettings } from "@/lib/site-data";
import { cn, formatDateShort } from "@/lib/utils";

const FEATURED_DRILLS = TACTICAL_DRILLS.filter((d) =>
  ["ctr-drills", "infiltration-navigation", "speed-march", "cbrn"].includes(d.id)
);

const CAREER_CARDS = CAREER_TRACKS.map((c) => ({
  id: c.id,
  href: c.href,
  image: c.image,
  tag: c.tag,
  title: c.title,
  imageFit: "imageFit" in c ? c.imageFit : undefined,
  imagePosition: "imagePosition" in c ? c.imagePosition : undefined,
  imageRepeat: "imageRepeat" in c ? c.imageRepeat : undefined,
}));

type KeyDateRow = { id: string; label: string; value: string };
type NewsRow = { id: string; slug: string; title: string; publishedAt: string };

type Props = {
  settings: PublicSiteSettings;
  keyDates: KeyDateRow[];
  newsPosts: NewsRow[];
  featuredHtml: string | null;
};

export function HomeArmy({
  settings,
  keyDates,
  newsPosts,
  featuredHtml,
}: Props) {
  const [featured, ...restNews] = newsPosts;
  const previewDates = keyDates.slice(0, 4);

  return (
    <div className="army-home scroll-deck">
      <div className="scroll-deck__hero">
        <HeroSlider exerciseYear={settings.exerciseYear} />
      </div>

      <StatsBar className="scroll-deck-layer--first" />

      <PatsSection
        id="mission"
        variant="mission"
        className="pats-section--mission-showcase"
      >
        <PatsMissionShowcase
          eyebrow="Concept / Purpose"
          quote={MISSION_QUOTE}
          body={MISSION_BODY}
          motto={MISSION_MOTTO}
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
            eyebrow="Participation"
            title="Start your PATS journey"
            description={REGISTRATION_INFO.description}
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
          <PatsImageGrid cards={CAREER_CARDS} />
        </div>
      </PatsSection>

      <PatsSection id="operations" variant="elevated">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="Operations"
            title="Live drills & mission pillars"
            description="Core competition modules — select a pillar for the full mission brief."
            align="center"
          />
          <div className="mx-auto mt-10 w-full max-w-[min(96rem,100%)]">
            <MissionPillarTrack drills={FEATURED_DRILLS} />
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/operations" className="pats-btn">
              Full operations brief
            </Link>
          </div>
        </ScrollReveal>
      </PatsSection>

      <PatsSection variant="dark">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <ScrollReveal>
            <PatsSectionHeading
              eyebrow="About PATS"
              title="Competition overview"
              description={ABOUT_PATS.lead}
            />
            <ul className="pats-body mt-6 space-y-3">
              {ABOUT_PATS.points.map((p) => (
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
                alt="PATS competition overview"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </ScrollReveal>
        </div>
      </PatsSection>

      <PatsSection
        variant="navy"
        className="pats-section--video-gallery overflow-hidden"
        innerClassName="overflow-hidden w-full max-w-full min-w-0"
      >
        <ScrollReveal className="w-full max-w-full min-w-0 overflow-hidden">
          <PatsVideoGallery videos={PATS_HOME_VIDEOS} />
        </ScrollReveal>
      </PatsSection>

      {featured && featuredHtml && (
        <PatsSection id="updates" variant="elevated">
          <ScrollReveal>
            <PatsSectionHeading
              eyebrow="Notices"
              title="Competition updates"
              align="center"
            />
            <div
              className={cn(
                "mx-auto mt-10 grid w-full gap-6",
                restNews.length > 0
                  ? "max-w-6xl lg:grid-cols-[1.2fr_1fr]"
                  : "max-w-2xl grid-cols-1"
              )}
            >
              <article className="pats-home-featured-news p-6 sm:p-8">
                <p className="pats-eyebrow">
                  {formatDateShort(new Date(featured.publishedAt))}
                </p>
                <h3 className="pats-home-featured-news__title pats-type-title mt-3 uppercase tracking-[0.06em]">
                  {featured.title}
                </h3>
                <div
                  className="pats-body prose-invert mt-4"
                  dangerouslySetInnerHTML={{ __html: featuredHtml }}
                />
                <Link
                  href={`/news/${featured.slug}`}
                  className="pats-home-read-more mt-4 inline-block"
                >
                  Read more →
                </Link>
              </article>
              {restNews.length > 0 && (
                <ul className="space-y-3">
                  {restNews.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/news/${post.slug}`}
                        className="pats-home-news-link block p-4 transition-colors sm:p-5"
                      >
                        <p className="pats-eyebrow">
                          {formatDateShort(new Date(post.publishedAt))}
                        </p>
                        <p className="pats-type-title mt-1 uppercase tracking-[0.06em]">
                          {post.title}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ScrollReveal>
        </PatsSection>
      )}

      {previewDates.length > 0 && (
        <PatsSection id="dates" variant="dark">
          <ScrollReveal className="mx-auto w-full max-w-3xl">
            <PatsSectionHeading
              eyebrow="Key dates"
              title="Schedule"
              align="center"
            />
            <ul className="pats-home-schedule mt-8 divide-y divide-[var(--lt-divider,var(--pats-border))] overflow-hidden">
              {previewDates.map((kd) => (
                <li
                  key={kd.id}
                  className="pats-home-schedule__row grid gap-2 px-4 py-4 transition-colors sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-6 sm:px-6"
                >
                  <span className="pats-schedule-label pats-type-eyebrow uppercase tracking-[0.14em]">
                    {kd.label}
                  </span>
                  <span className="pats-schedule-value pats-type-body">
                    {kd.value}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <Link href="/key-dates" className="pats-btn">
                Full schedule
              </Link>
            </div>
          </ScrollReveal>
        </PatsSection>
      )}
    </div>
  );
}
