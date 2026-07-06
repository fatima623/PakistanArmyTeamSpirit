"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { mechanicalTransition } from "@/components/cinematic/motion";
import type { TacticalDrill } from "@/lib/pats-content";
import { CATEGORY_PILLAR_META } from "@/lib/mission-pillars";
import { cn } from "@/lib/utils";

const DIFFICULTY_CLASS = {
  foundational: "tac-difficulty--foundational",
  intermediate: "tac-difficulty--intermediate",
  advanced: "tac-difficulty--advanced",
  elite: "tac-difficulty--elite",
} as const;

type Props = {
  drill: TacticalDrill;
  index?: number;
  variant?: "grid" | "pillar";
};

export function DrillCard({ drill, index = 0, variant = "grid" }: Props) {
  const reduce = useReducedMotion();
  const meta = CATEGORY_PILLAR_META[drill.category];
  const isPillar = variant === "pillar";
  const title = isPillar ? meta.pillar : drill.title;

  const card = (
    <Link
      href={`/operations/${drill.id}`}
      className={cn(
        "tac-mission-card group h-full w-full min-h-0",
        isPillar && "tac-mission-card--pillar"
      )}
    >
      <div className="tac-mission-card__veil" aria-hidden />

      <div className="tac-mission-card__inner">
        <span
          className={cn(
            "tac-mission-card__badge tac-difficulty",
            DIFFICULTY_CLASS[drill.difficulty]
          )}
        >
          {drill.difficulty}
        </span>

        <h3 className="tac-mission-card__title">{title}</h3>

        <p className="tac-mission-card__desc">{drill.purpose}</p>

        <span className="tac-mission-card__footer">
          Mission brief
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );

  if (reduce) return card;

  return (
    <motion.div
      className="forest-card-slide-host h-full w-full min-w-0"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ ...mechanicalTransition, duration: 0.55, delay: index * 0.05 }}
    >
      {card}
    </motion.div>
  );
}
