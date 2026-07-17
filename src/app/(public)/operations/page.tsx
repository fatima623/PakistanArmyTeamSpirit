import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { DrillCard } from "@/components/operations/DrillCard";
import { ForestCardCarousel } from "@/components/pats/ForestCardCarousel";
import { OperationalMap } from "@/components/operations/OperationalMap";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { translatePatsText } from "@/lib/i18n/pats-content-i18n";
import {
  OPERATIONAL_RULES,
  OVERVIEW,
  TACTICAL_DRILLS,
  TOTAL_MARKS,
  type DrillPhase,
} from "@/lib/pats-content";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.marketing.operations.meta.title,
    description: t.marketing.operations.meta.description,
  };
}

/**
 * Order the phase sections appear in. The visible label for each comes from
 * `t.marketing.operations.phases`, keyed by this (raw) phase id — the id itself
 * must stay untranslated because it also filters `TACTICAL_DRILLS`.
 */
const PHASE_ORDER: readonly DrillPhase[] = [
  "preparation",
  "infiltration",
  "hideout",
  "ctr",
  "exfiltration",
  "terminal",
];

export default async function OperationsPage() {
  const { t, locale } = await getDictionary();
  const ops = t.marketing.operations;
  const totalMarks = TOTAL_MARKS.toLocaleString();

  return (
    <div className="space-y-0">
      <PatsPageHero
        eyebrow={ops.hero.eyebrow}
        title={ops.hero.title}
        subtitle={ops.hero.subtitle}
        meta={[
          { label: ops.hero.metaEvents, value: String(TACTICAL_DRILLS.length) },
          { label: ops.hero.metaTotalMarks, value: totalMarks },
          { label: ops.hero.metaDuration, value: ops.hero.metaDurationValue },
        ]}
      />

      <PatsSection variant="navy">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={ops.overview.eyebrow}
            title={ops.overview.title}
            description={translatePatsText(OVERVIEW.lead, locale)}
          />
        </ScrollReveal>
        <div className="pats-highlight-grid pats-highlight-grid--5 mt-8 items-stretch">
          {OVERVIEW.highlights.map((h) => (
            <div key={h.label} className="pats-highlight-cell">
              <p className="pats-highlight-cell__label">
                {translatePatsText(h.label, locale)}
              </p>
              <p className="pats-highlight-cell__value">
                {translatePatsText(h.value, locale)}
              </p>
            </div>
          ))}
        </div>
        <p className="pats-body mt-6">
          {ops.scoredSummary(TACTICAL_DRILLS.length, totalMarks)}
        </p>
      </PatsSection>

      <PatsSection variant="elevated">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={ops.route.eyebrow}
            title={ops.route.title}
            description={ops.route.description}
          />
        </ScrollReveal>
        <ScrollReveal className="mt-8">
          <OperationalMap />
        </ScrollReveal>
      </PatsSection>

      {PHASE_ORDER.map((phase) => {
        const drills = TACTICAL_DRILLS.filter((d) => d.phase === phase);
        if (drills.length === 0) return null;
        const label = ops.phases[phase];
        return (
          <PatsSection key={phase} variant="deepest">
            <ScrollReveal>
              <PatsSectionHeading
                eyebrow={label}
                title={label}
                description={ops.phaseSummary(drills.length)}
              />
            </ScrollReveal>
            <div className="mt-8">
              <ForestCardCarousel
                ariaLabel={ops.phaseCarouselAria(label)}
                autoPlayMs={0}
              >
                {drills.map((drill, i) => (
                  <DrillCard key={drill.id} drill={drill} index={i} />
                ))}
              </ForestCardCarousel>
            </div>
          </PatsSection>
        );
      })}

      <PatsSection variant="dark">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={ops.rules.eyebrow}
            title={ops.rules.title}
            description={ops.rules.description}
          />
        </ScrollReveal>
        <div className="pats-rules-grid mt-8 grid gap-3 md:grid-cols-2">
          {OPERATIONAL_RULES.map((rule) => (
            <div
              key={rule.id}
              className={
                "severity" in rule && rule.severity === "critical"
                  ? "pats-rule-card pats-rule-card--critical"
                  : "pats-rule-card"
              }
            >
              <h3>{translatePatsText(rule.title, locale)}</h3>
              <p className="pats-body mt-1.5">
                {translatePatsText(rule.body, locale)}
              </p>
            </div>
          ))}
        </div>
      </PatsSection>
    </div>
  );
}
