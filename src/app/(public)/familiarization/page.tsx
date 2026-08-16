import type { Metadata } from "next";
import Image from "next/image";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { FamiliarizationAnchorNav } from "@/components/familiarization/FamiliarizationAnchorNav";
import { FamiliarizationHeading } from "@/components/familiarization/FamiliarizationHeading";
import { WeaponsEquipmentTables } from "@/components/familiarization/WeaponsEquipmentTables";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import {
  CONCEPT_DIAGRAM,
  CONCEPT_LEGS,
  FAMILIARIZATION_ANCHORS,
  TEAM_COMPOSITION_NOTE,
  TRAINING_MODULES,
} from "@/lib/familiarization-content";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  translatePatsList,
  translatePatsText,
} from "@/lib/i18n/pats-content-i18n";
import { TEAM_ROLES } from "@/lib/pats-content";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.marketing.familiarization.meta.title,
    description: t.marketing.familiarization.meta.description,
  };
}

/**
 * Familiarization of PATS — the pre-arrival brief, gathered under one nav
 * heading rather than scattered across /operations, /awards and /documents.
 *
 * Everything on this page is a view over content that already exists in
 * `@/lib/pats-content` (drills, team roles, operational rules, training
 * modules), extended by `@/lib/familiarization-content` with the material that
 * had no home yet — the route legs and the weapons & equipment scale.
 *
 * The page runs on its own blue-and-white palette and its own `fam-*` class
 * vocabulary (see globals.css). It does not reuse the shared `pats-panel` /
 * `pats-rule-card` surfaces, because those are pinned to the site's gold accent
 * by `!important` light-theme rules.
 */
export default async function FamiliarizationPage() {
  const { t, locale } = await getDictionary();
  const fam = t.marketing.familiarization;

  const anchorItems = FAMILIARIZATION_ANCHORS.map((id) => ({
    id,
    label: fam.anchors[id],
  }));

  return (
    <div className="fam-page space-y-0">
      <PatsPageHero
        eyebrow={fam.hero.eyebrow}
        title={fam.hero.title}
        subtitle={fam.hero.subtitle}
        meta={[
          { label: fam.hero.metaDuration, value: fam.hero.metaDurationValue },
          { label: fam.hero.metaDistance, value: fam.hero.metaDistanceValue },
          { label: fam.hero.metaTeam, value: fam.hero.metaTeamValue },
        ]}
      />

      <FamiliarizationAnchorNav
        items={anchorItems}
        ariaLabel={fam.anchorsAria}
      />

      {/* ── Concept of PATS ──────────────────────────────────────────── */}
      <PatsSection id="concept" variant="navy" innerClassName="fam-inner">
        <ScrollReveal>
          <FamiliarizationHeading
            eyebrow={fam.concept.eyebrow}
            title={fam.concept.title}
            description={fam.concept.description}
          />
        </ScrollReveal>

        <figure className="fam-diagram">
          {/* The diagram carries a lot of small type, so below `md` the frame
              scrolls sideways at a legible width instead of shrinking to fit. */}
          <div className="fam-diagram__frame">
            <Image
              src={CONCEPT_DIAGRAM.src}
              alt={fam.concept.imageAlt}
              width={CONCEPT_DIAGRAM.width}
              height={CONCEPT_DIAGRAM.height}
              className="fam-diagram__image"
              sizes="(min-width: 1280px) 1280px, (min-width: 768px) 100vw, 40rem"
              priority
            />
          </div>
          <figcaption className="fam-diagram__caption">
            {fam.concept.imageCaption}
          </figcaption>
        </figure>
      </PatsSection>

      {/* ── Route legs ───────────────────────────────────────────────── */}
      <PatsSection id="route" variant="dark" innerClassName="fam-inner">
        <ScrollReveal>
          <FamiliarizationHeading
            eyebrow={fam.route.eyebrow}
            title={fam.route.title}
            description={fam.route.description}
          />
        </ScrollReveal>

        <ol className="fam-leg-list">
          {CONCEPT_LEGS.map((leg, index) => (
            <li key={leg.id} className="fam-leg">
              <span className="fam-leg__index" aria-hidden>
                {index + 1}
              </span>
              <div className="fam-leg__body">
                <div className="fam-leg__head">
                  <h3 className="fam-leg__title">
                    {translatePatsText(leg.label, locale)}
                  </h3>
                  {leg.distance && (
                    <span className="fam-leg__distance">
                      <span className="fam-leg__distance-label">
                        {fam.route.distanceLabel}
                      </span>
                      {translatePatsText(leg.distance, locale)}
                    </span>
                  )}
                </div>
                <p className="fam-leg__text">
                  {translatePatsText(leg.body, locale)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="fam-total">
          <span className="fam-total__label">{fam.route.totalLabel}</span>
          <span className="fam-total__value">{fam.route.totalValue}</span>
        </p>
      </PatsSection>

      {/* ── Team composition ─────────────────────────────────────────── */}
      <PatsSection id="team" variant="deepest" innerClassName="fam-inner">
        <ScrollReveal>
          <FamiliarizationHeading
            eyebrow={fam.team.eyebrow}
            title={fam.team.title}
            description={fam.team.description}
          />
        </ScrollReveal>

        <div className="fam-grid fam-grid--2">
          <div className="fam-table-wrap">
            <table className="fam-table">
              <caption className="sr-only">{fam.team.title}</caption>
              <thead>
                <tr>
                  <th scope="col">{fam.team.roleHeading}</th>
                  <th scope="col" className="fam-table__num">
                    {fam.team.strengthHeading}
                  </th>
                </tr>
              </thead>
              <tbody>
                {TEAM_ROLES.map((role) => (
                  <tr key={role.role}>
                    <th scope="row">{translatePatsText(role.role, locale)}</th>
                    <td className="fam-table__num">
                      {translatePatsText(role.qty, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="fam-card">
            <p className="fam-card__label">{fam.team.noteLabel}</p>
            <p className="fam-card__body">
              {translatePatsText(TEAM_COMPOSITION_NOTE, locale)}
            </p>
          </div>
        </div>
      </PatsSection>

      {/* ── Weapons & equipment ──────────────────────────────────────── */}
      <PatsSection id="equipment" variant="navy" innerClassName="fam-inner">
        <ScrollReveal>
          <FamiliarizationHeading
            eyebrow={fam.equipment.eyebrow}
            title={fam.equipment.title}
            description={fam.equipment.description}
          />
        </ScrollReveal>

        <WeaponsEquipmentTables
          locale={locale}
          itemHeading={fam.equipment.itemHeading}
          indlHeading={fam.equipment.indlHeading}
          teamHeading={fam.equipment.teamHeading}
          groupLabels={fam.equipment.groups}
          notApplicable={fam.equipment.notApplicable}
        />

        <p className="fam-note">{fam.equipment.note}</p>
      </PatsSection>

      {/* ── Familiarization training (moved here from /international) ── */}
      <PatsSection id="training" variant="elevated" innerClassName="fam-inner">
        <ScrollReveal>
          <FamiliarizationHeading
            eyebrow={fam.training.eyebrow}
            title={fam.training.title}
            description={fam.training.description}
          />
        </ScrollReveal>

        <ul className="fam-module-grid">
          {translatePatsList(TRAINING_MODULES, locale).map((module) => (
            <li key={module} className="fam-module">
              {module}
            </li>
          ))}
        </ul>
      </PatsSection>
    </div>
  );
}
