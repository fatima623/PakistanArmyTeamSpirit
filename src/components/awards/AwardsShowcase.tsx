"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

import { mechanicalTransition } from "@/components/cinematic/motion";
import { STANDINGS_PREVIEW } from "@/lib/leaderboard";
import { PATS_CROP } from "@/lib/media";

type MedalCard = {
  id: "gold" | "silver" | "bronze" | "certificate";
  tier: string;
  name: string;
  range: string;
  imageSrc: string;
  imageAlt: string;
  highQuality?: boolean;
  /** True for photographed medals (fill the frame) vs. transparent renders. */
  photo?: boolean;
};

const MEDAL_CARDS: readonly MedalCard[] = [
  {
    id: "gold",
    tier: "Gold tier",
    name: "Gold Medal",
    range: "75% and above",
    imageSrc: "/awards/pats-medal-gold.jpeg",
    imageAlt: "PATS gold medal — Pakistan Army Team Spirit Competition",
    highQuality: true,
    photo: true,
  },
  {
    id: "silver",
    tier: "Silver tier",
    name: "Silver Medal",
    range: "65% to 74.99%",
    imageSrc: "/awards/pats-medal-silver.jpeg",
    imageAlt: "PATS silver medal — Pakistan Army Team Spirit Competition",
    highQuality: true,
    photo: true,
  },
  {
    id: "bronze",
    tier: "Bronze tier",
    name: "Bronze Medal",
    range: "55% to 64.99%",
    imageSrc: "/awards/pats-medal-bronze.jpeg",
    imageAlt: "PATS bronze medal — Pakistan Army Team Spirit Competition",
    highQuality: true,
    photo: true,
  },
  {
    id: "certificate",
    tier: "Participation",
    name: "Certificate",
    range: "Below 65%",
    imageSrc: PATS_CROP.awardCertificateDisplay,
    imageAlt: "PATS certificate of participation",
  },
];

export function AwardsShowcase() {
  const reduce = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

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
        <p className="pats-awards-showcase__label">Honors registry</p>
        <div className="pats-awards-showcase__rule" aria-hidden />
        <h2 className="pats-section-title pats-awards-showcase__title">
          Awards and honors
        </h2>
        <p className="pats-awards-showcase__subtitle">
          Teams are graded across all tactical events. Overall percentage determines medal
          tier and certificate of participation.
        </p>
      </header>

      <div ref={gridRef} className="pats-awards-hero-grid">
        {MEDAL_CARDS.map((card) => (
          <article
            key={card.id}
            className={`pats-awards-hero-card pats-awards-hero-card--${card.id}${
              card.photo ? " pats-awards-hero-card--photo" : ""
            }`}
          >
            <div className="pats-awards-hero-card__visual">
              <Image
                src={card.imageSrc}
                alt={card.imageAlt}
                fill
                className="pats-awards-hero-card__image"
                unoptimized={card.highQuality}
                quality={100}
                sizes="(max-width: 639px) 100vw, 50vw"
                priority={card.id === "gold" || card.id === "silver"}
              />
            </div>
            <div className="pats-awards-hero-card__footer">
              <p className="pats-awards-hero-card__tier">{card.tier}</p>
              <h3 className="pats-awards-hero-card__name">{card.name}</h3>
              <p className="pats-awards-hero-card__score">{card.range}</p>
            </div>
          </article>
        ))}
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...mechanicalTransition, delay: 0.08 }}
        className="pats-awards-showcase__standings"
      >
        <div className="pats-awards-standings__header">
          <h3 className="pats-awards-standings__title">Current standings</h3>
          <span className="pats-awards-standings__badge">Live telemetry</span>
        </div>

        <div className="pats-awards-standings__list">
          {STANDINGS_PREVIEW.map((row) => (
            <div key={row.rank} className="pats-awards-standings__row">
              <span className="pats-awards-standings__rank">
                {String(row.rank).padStart(2, "0")}
              </span>
              <span>
                <span className="pats-awards-standings__team">{row.team}</span>
                <span className="pats-awards-standings__nation">{row.nation}</span>
              </span>
              <span className="pats-awards-standings__score">
                {row.score.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>

        <p className="pats-awards-standings__footnote">
          Illustrative standings for command review. Final results certified post-exercise.
        </p>
      </motion.div>
    </div>
  );
}
