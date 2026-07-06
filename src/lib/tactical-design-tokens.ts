/**
 * PATS military-grade design tokens — single source for CSS variables & TS consumers.
 * Tactical realism: disciplined, low-saturation, sharp geometry.
 */

export const TAC_COLORS = {
  carbon: "#0D0F0E",
  carbonRaised: "#121614",
  oliveDrab: "#2a3d28",
  combatWhite: "#FFFFFF",
  combatGray: "#EBEBEB",
  khaki: "#C5A880",
  khakiMuted: "#8B9676",
  alertAmber: "#B8860B",
  alertRed: "#8B3A2A",
} as const;

export const TAC_MOTION = {
  easeMechanical: [0.16, 1, 0.3, 1] as const,
  durationReveal: 0.8,
  durationMicro: 0.22,
  staggerNav: 0.06,
  staggerContent: 0.1,
} as const;

export const TAC_RADIUS = {
  none: "0px",
  micro: "2px",
  sharp: "4px",
} as const;

export const TAC_SPACING = {
  unit: 4,
  baseline: 8,
} as const;
