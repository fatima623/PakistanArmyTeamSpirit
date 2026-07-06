"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { ContingentDrawer } from "@/components/international/ContingentDrawer";
import { mechanicalTransition } from "@/components/cinematic/motion";
import { CONTINGENTS, type ContingentRecord } from "@/lib/contingents";
import { cn } from "@/lib/utils";

function countryFlag(code: string): string {
  const a = 0x1f1e6 - 65;
  const chars = code.toUpperCase().split("");
  if (chars.length !== 2) return "";
  return String.fromCodePoint(
    ...chars.map((c) => a + c.charCodeAt(0))
  );
}

export function NationsWall() {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<ContingentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const contingents = useMemo(() => CONTINGENTS, []);

  const openContingent = (c: ContingentRecord) => {
    setSelected(c);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="tac-nation-grid grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {contingents.map((c, i) => (
          <motion.button
            key={c.code}
            type="button"
            onClick={() => openContingent(c)}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ ...mechanicalTransition, duration: 0.45, delay: (i % 9) * 0.04 }}
            className={cn(
              "tac-nation-chip rounded-sm border border-white/10 bg-tactical-carbon-raised/80 px-4 py-3 text-left",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tactical-brass"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none" aria-hidden>
                {countryFlag(c.code)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-tactical-khaki">
                  {c.label.split("—")[0]?.trim()}
                </p>
                <p className="mt-1 font-display text-sm font-bold uppercase leading-snug text-white">
                  {c.designation}
                </p>
                <p className="mt-2 font-mono text-[10px] tabular-nums text-tactical-sand-dim">
                  {c.appearances} ED · LAST {c.lastEdition}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <ContingentDrawer
        contingent={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
