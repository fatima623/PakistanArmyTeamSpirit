import type { Variants } from "framer-motion";

import { TAC_MOTION } from "@/lib/tactical-design-tokens";

/** Mechanical defense-interface easing */
export const MECHANICAL_EASE = TAC_MOTION.easeMechanical;

export const mechanicalTransition = {
  duration: TAC_MOTION.durationReveal,
  ease: MECHANICAL_EASE,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TAC_MOTION.durationReveal,
      ease: MECHANICAL_EASE,
    },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "linear" },
  },
};

export const navDrop: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TAC_MOTION.durationReveal,
      ease: MECHANICAL_EASE,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: MECHANICAL_EASE },
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: MECHANICAL_EASE },
  },
};

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: TAC_MOTION.staggerContent,
      delayChildren: 0.08,
    },
  },
};

export const viewportOnce = { once: true, margin: "-60px" as const };
