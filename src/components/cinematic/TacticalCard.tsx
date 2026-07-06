"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

export function TacticalCard({ children, className }: Props) {
  const reduce = useReducedMotion();
  const base = cn(
    "cinematic-glass group relative overflow-hidden rounded-sm border border-white/10 p-5 transition-all duration-500",
    "hover:border-tactical-brass/35 hover:shadow-tac-glow sm:p-6",
    className
  );

  const inner = (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-tactical-olive/8 via-transparent to-tactical-brass/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-8 top-0 h-px w-24 bg-tactical-brass/0 transition-all duration-500 group-hover:left-0 group-hover:bg-tactical-brass/50"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </>
  );

  if (reduce) {
    return <div className={base}>{inner}</div>;
  }

  return (
    <motion.div
      className={base}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </motion.div>
  );
}
