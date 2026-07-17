"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Medal, ScrollText } from "lucide-react";
import { useEffect, useRef } from "react";

import { mechanicalTransition } from "@/components/cinematic/motion";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getMedalTierStandings, type MedalTierId } from "@/lib/leaderboard";
import { PATS_CROP } from "@/lib/media";

type MedalAsset = {
  id: MedalTierId;
  imageSrc: string;
  imageAlt: string;
};

/* The three medals are background-free alpha cut-outs (generated from the studio
   photographs by scripts/remove-medal-background.js), so they float directly on the
   card panel. The certificate is a document scan and keeps its framed treatment —
   the `--doc` / `--render` thumb modifiers below encode that difference. */
const MEDAL_ASSETS: readonly MedalAsset[] = [
  {
    id: "gold",
    imageSrc: "/awards/pats-medal-gold.png",
    imageAlt: "PATS gold medal — Pakistan Army Team Spirit Competition",
  },
  {
    id: "silver",
    imageSrc: "/awards/pats-medal-silver.png",
    imageAlt: "PATS silver medal — Pakistan Army Team Spirit Competition",
  },
  {
    id: "bronze",
    imageSrc: "/awards/pats-medal-bronze.png",
    imageAlt: "PATS bronze medal — Pakistan Army Team Spirit Competition",
  },
  {
    id: "certificate",
    imageSrc: PATS_CROP.awardCertificateDisplay,
    imageAlt: "PATS certificate of participation",
  },
];

const TIER_STANDINGS = getMedalTierStandings();

export function AwardsShowcase() {
  const { t } = useI18n();
  const p = t.publicSite.pages.awards;
  const reduce = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  // Per-tier localized labels, keyed by tier id.
  const tierLabel: Record<MedalTierId, string> = {
    gold: p.tierGold,
    silver: p.tierSilver,
    bronze: p.tierBronze,
    certificate: p.tierParticipation,
  };
  const medalName: Record<MedalTierId, string> = {
    gold: p.nameGold,
    silver: p.nameSilver,
    bronze: p.nameBronze,
    certificate: p.nameCertificate,
  };
  const medalRange: Record<MedalTierId, string> = {
    gold: p.rangeGold,
    silver: p.rangeSilver,
    bronze: p.rangeBronze,
    certificate: p.rangeCertificate,
  };
  const categoryLabel: Record<MedalTierId, string> = {
    gold: p.metaGold,
    silver: p.metaSilver,
    bronze: p.metaBronze,
    certificate: p.nameCertificate,
  };

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (reduce) {
      grid.classList.add("pats-awards-hero-grid--visible");
      return;
    }

    const reveal = () => grid.classList.add("pats-awards-hero-grid--visible");

    const showIfInView = () => {
      const rect = grid.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
        reveal();
        return true;
      }
      return false;
    };

    if (showIfInView()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <div className="pats-awards-showcase">
      <header className="pats-awards-showcase__header">
        <p className="pats-awards-showcase__label">{p.showcaseLabel}</p>
        <div className="pats-awards-showcase__rule" aria-hidden />
        <h2 className="pats-section-title pats-awards-showcase__title">
          {p.showcaseTitle}
        </h2>
        <p className="pats-awards-showcase__subtitle">{p.showcaseSubtitle}</p>
      </header>

      <div ref={gridRef} className="pats-awards-hero-grid">
        {MEDAL_ASSETS.map((card) => {
          const isCertificate = card.id === "certificate";
          const BadgeIcon = isCertificate ? ScrollText : Medal;
          return (
            <article
              key={card.id}
              className={`pats-awards-hero-card pats-awards-hero-card--${card.id}`}
            >
              <div className="pats-awards-hero-card__visual">
                <span className="pats-awards-hero-card__badge" aria-hidden>
                  <BadgeIcon />
                </span>
                <div
                  className={`pats-awards-hero-card__thumb ${
                    isCertificate
                      ? "pats-awards-hero-card__thumb--doc"
                      : "pats-awards-hero-card__thumb--render"
                  }`}
                >
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    className="pats-awards-hero-card__image"
                    quality={100}
                    sizes="240px"
                    priority={card.id === "gold" || card.id === "silver"}
                  />
                </div>
              </div>
              <div className="pats-awards-hero-card__footer">
                <p className="pats-awards-hero-card__tier">
                  {tierLabel[card.id]}
                </p>
                <h3 className="pats-awards-hero-card__name">
                  {medalName[card.id]}
                </h3>
                <p className="pats-awards-hero-card__score">
                  {medalRange[card.id]}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...mechanicalTransition, delay: 0.08 }}
        className="pats-awards-showcase__standings"
      >
        <div className="pats-awards-standings__header">
          <div>
            <h3 className="pats-awards-standings__title">{p.standingsTitle}</h3>
            <p className="pats-awards-standings__subtitle">
              {p.standingsSubtitle}
            </p>
          </div>
          <span className="pats-awards-standings__badge">
            {p.standingsBadge}
          </span>
        </div>

        <div className="pats-awards-standings__scroll">
          <table className="pats-awards-standings__table">
            <caption className="sr-only">{p.standingsSubtitle}</caption>
            <thead>
              <tr>
                <th scope="col">{p.colMedal}</th>
                <th scope="col">{p.colMinimum}</th>
                <th scope="col">{p.colCountries}</th>
              </tr>
            </thead>
            <tbody>
              {TIER_STANDINGS.map((tier) => (
                <tr
                  key={tier.id}
                  className={`pats-awards-standings__tier-row pats-awards-standings__tier-row--${tier.id}`}
                >
                  <th scope="row" data-label={p.colMedal}>
                    <span className="pats-awards-standings__tier">
                      <span
                        className="pats-awards-standings__dot"
                        aria-hidden
                      />
                      {categoryLabel[tier.id]}
                    </span>
                  </th>
                  <td data-label={p.colMinimum}>
                    <span className="pats-awards-standings__min">
                      {tier.minPercent != null ? `≥ ${tier.minPercent}%` : "—"}
                    </span>
                    <span className="pats-awards-standings__band">
                      {medalRange[tier.id]}
                    </span>
                  </td>
                  <td data-label={p.colCountries}>
                    {tier.countries.length > 0 ? (
                      <ul className="pats-awards-standings__countries">
                        {tier.countries.map((c) => (
                          <li
                            key={c.team}
                            className="pats-awards-standings__country"
                          >
                            <span className="pats-awards-standings__country-name">
                              {c.nation}
                            </span>
                            <span className="pats-awards-standings__country-score">
                              {c.score.toFixed(1)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="pats-awards-standings__none">
                        {p.noTeams}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="pats-awards-standings__footnote">
          {p.standingsFootnote}
        </p>
      </motion.div>
    </div>
  );
}
