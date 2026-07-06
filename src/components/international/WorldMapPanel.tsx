"use client";

import { useMemo } from "react";

import {
  COUNTRY_NAMES,
  INTERNATIONAL_EDITIONS,
  type CountryCode,
} from "@/lib/pats-content";

/** Approximate map positions (percent) for participating nations */
const MAP_POSITIONS: Partial<Record<CountryCode, { left: string; top: string }>> = {
  CN: { left: "72%", top: "38%" },
  TR: { left: "54%", top: "36%" },
  JO: { left: "52%", top: "42%" },
  MY: { left: "74%", top: "58%" },
  GB: { left: "44%", top: "28%" },
  LK: { left: "68%", top: "52%" },
  SA: { left: "54%", top: "46%" },
  ZA: { left: "52%", top: "72%" },
  UZ: { left: "62%", top: "34%" },
  KE: { left: "54%", top: "58%" },
  MA: { left: "42%", top: "44%" },
  NP: { left: "66%", top: "40%" },
  IQ: { left: "53%", top: "40%" },
  TH: { left: "72%", top: "48%" },
  QA: { left: "56%", top: "48%" },
  US: { left: "18%", top: "38%" },
  KZ: { left: "60%", top: "30%" },
  BH: { left: "57%", top: "47%" },
  PK: { left: "61%", top: "42%" },
  BY: { left: "52%", top: "26%" },
  AZ: { left: "58%", top: "36%" },
  GH: { left: "44%", top: "54%" },
  MV: { left: "66%", top: "56%" },
};

export function WorldMapPanel() {
  const nations = useMemo(() => {
    const set = new Set<CountryCode>();
    INTERNATIONAL_EDITIONS.forEach((e) =>
      e.countries.forEach((c) => set.add(c))
    );
    return [...set];
  }, []);

  return (
    <div className="tac-world-map rounded-sm">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath fill='%233d5230' fill-opacity='0.35' d='M120 180 Q200 120 280 160 T420 140 T580 200 T720 160 L720 280 Q600 320 480 300 T280 320 T120 280 Z'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-tactical-grid bg-grid-48 opacity-20" />
      <p className="absolute left-4 top-4 z-10 font-condensed text-[10px] font-bold uppercase tracking-[0.3em] text-tactical-brass">
        Global participation — active nations
      </p>
      {nations.map((code, i) => {
        const pos = MAP_POSITIONS[code];
        if (!pos) return null;
        return (
          <span
            key={code}
            className="tac-world-dot group/dot"
            style={{
              left: pos.left,
              top: pos.top,
              animationDelay: `${(i % 8) * 0.35}s`,
            }}
            title={COUNTRY_NAMES[code]}
          >
            <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-sm border border-white/15 bg-tactical-void/95 px-2 py-0.5 font-condensed text-[10px] uppercase tracking-wide text-white group-hover/dot:block">
              {COUNTRY_NAMES[code]}
            </span>
          </span>
        );
      })}
      <p className="absolute bottom-4 right-4 font-condensed text-xs text-white/40">
        {nations.length} partner nations · 2017–2025
      </p>
    </div>
  );
}
