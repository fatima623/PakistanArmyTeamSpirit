"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { HudMetaStrip } from "@/components/cinematic/HudMetaStrip";
import { TacticalHud } from "@/components/cinematic/TacticalHud";
import { fadeUp, stagger } from "@/components/cinematic/motion";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translatePatsText } from "@/lib/i18n/pats-content-i18n";
import type { TacticalDrill } from "@/lib/pats-content";
import { operationCode } from "@/lib/ops-code";
import { cn } from "@/lib/utils";

type Props = {
  drill: TacticalDrill;
  opIndex: number;
};

export function MissionBrief({ drill, opIndex }: Props) {
  const reduce = useReducedMotion();
  const { t, locale } = useI18n();
  const ops = t.marketing.operations;
  const b = ops.brief;
  // A mission code (PATS-INF-07), not prose — identical in every locale.
  const code = operationCode(drill, opIndex);

  return (
    <article className="tac-brief-classified relative overflow-hidden rounded-sm">
      <TacticalHud scan={!reduce} frame />
      <header className="tac-brief-header relative z-10 px-6 py-5 sm:px-8 sm:py-6">
        <Link
          href="/operations"
          className="cinematic-link font-condensed text-xs font-semibold uppercase tracking-[0.2em]"
        >
          {b.back}
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="tac-ops-code">{code}</span>
            <p className="mt-3 font-condensed text-xs font-bold uppercase tracking-[0.28em] text-brand-brass">
              {b.classified}
            </p>
            <h1 className="cinematic-heading mt-2 font-display text-2xl font-bold uppercase text-white sm:text-4xl">
              {translatePatsText(drill.title, locale)}
            </h1>
          </div>
          <div className="text-right">
            <p className="font-condensed text-[10px] uppercase tracking-widest text-white/45">
              {b.totalMarks}
            </p>
            <p className="font-display text-3xl font-bold text-brand-brass sm:text-4xl">
              {drill.marks}
            </p>
          </div>
        </div>
        <HudMetaStrip
          className="mt-5"
          items={[
            { label: b.phase, value: ops.phases[drill.phase] },
            { label: b.category, value: ops.category[drill.category] },
            { label: b.difficulty, value: ops.difficulty[drill.difficulty] },
            ...(drill.checkpoint
              ? [
                  {
                    label: b.checkpoint,
                    // Mostly acronym codes ("CP 4 / CTR") — these fall back
                    // untranslated by design.
                    value: translatePatsText(drill.checkpoint, locale),
                  },
                ]
              : []),
          ]}
        />
      </header>

      <motion.div
        className="relative z-10 space-y-8 px-6 py-8 sm:px-8 sm:py-10"
        initial={reduce ? false : "hidden"}
        animate="visible"
        variants={stagger}
      >
        <motion.section variants={fadeUp}>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-brass">
            {b.objective}
          </h2>
          <p className="cinematic-body mt-3 max-w-3xl font-sans text-lg leading-relaxed text-white/90">
            {translatePatsText(drill.purpose, locale)}
          </p>
        </motion.section>

        <motion.section variants={fadeUp}>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-brass">
            {b.objectives}
          </h2>
          <ul className="mt-4 space-y-3">
            {drill.objectives.map((o, i) => (
              <li
                key={o}
                className="flex gap-4 rounded-sm border border-white/8 bg-white/[0.02] px-4 py-3 font-condensed text-base leading-relaxed text-white/85"
              >
                <span className="font-display text-sm font-bold text-brand-brass">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {translatePatsText(o, locale)}
              </li>
            ))}
          </ul>
        </motion.section>

        {drill.scoring && drill.scoring.length > 0 && (
          <motion.section variants={fadeUp}>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-brass">
              {b.scoring}
            </h2>
            <div className="mt-4 overflow-hidden rounded-sm border border-brand-brass/20">
              {drill.scoring.map((line, i) => {
                const pct = Math.round((line.marks / drill.marks) * 100);
                return (
                  <div
                    key={line.label}
                    className={cn(
                      "px-5 py-4",
                      i % 2 === 1 && "bg-brand-night-2/50"
                    )}
                  >
                    <div className="flex justify-between gap-4 font-condensed text-sm">
                      <span className="text-white/90">
                        {translatePatsText(line.label, locale)}
                      </span>
                      <span className="font-bold text-brand-brass">
                        {line.marks} {b.marksUnit}
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-brand-olive to-brand-brass transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {drill.rules && (
          <motion.section
            variants={fadeUp}
            className="group rounded-sm border border-white/8 bg-white/[0.03] p-5 transition-colors duration-150 hover:border-brand-red/50 hover:bg-brand-red/10"
          >
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-brass transition-colors duration-150 group-hover:text-red-200">
              {b.criticalNotice}
            </h2>
            <ul className="mt-3 space-y-2 font-condensed text-base text-white/80 transition-colors duration-150 group-hover:text-red-100/90">
              {drill.rules.map((r) => (
                <li key={r}>{translatePatsText(r, locale)}</li>
              ))}
            </ul>
          </motion.section>
        )}

        <motion.section variants={fadeUp}>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-brass">
            {b.skills}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {drill.skills.map((s) => (
              <span
                key={s}
                className="rounded-sm border border-brand-olive/40 bg-brand-olive/15 px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-wide text-brand-sand"
              >
                {translatePatsText(s, locale)}
              </span>
            ))}
          </div>
        </motion.section>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
          <Link href="/gallery" className="cinematic-btn-ghost">
            {b.relatedArchive}
          </Link>
          <Link href="/operations" className="cinematic-btn-ghost">
            {b.allMissions}
          </Link>
        </motion.div>
      </motion.div>
    </article>
  );
}
