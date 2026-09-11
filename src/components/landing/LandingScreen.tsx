"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { LandingLanguageSwitcher } from "@/components/landing/LandingLanguageSwitcher";
import { LandingLoginDialog } from "@/components/landing/LandingLoginDialog";
import { PatsLogo } from "@/components/pats/PatsLogo";
import { HERO_MOTTO } from "@/lib/branding";
import { computeExerciseYear } from "@/lib/exercise-year";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Props = {
  /** Server-rendered edition year; re-derived on mount (see below). */
  exerciseYear: number;
};

/**
 * The public front page — the only thing an anonymous visitor may see.
 *
 * Nothing about the exercise is published here: no navbar, no sections, no
 * photography, no footer. Just the crest, the competition's own name and
 * standfirst (the same strings the home page uses, which now lives at `/tour`
 * behind the login), and the way in. Signing in is a dialog over this screen
 * rather than a separate page, so the visitor never leaves it.
 */
export function LandingScreen({ exerciseYear }: Props) {
  const { t, locale, dir } = useI18n();
  const [loginOpen, setLoginOpen] = useState(false);
  const [year, setYear] = useState(exerciseYear);

  // Same edition-year rule as the hero: the server value is the published
  // setting, then the client re-derives it so a page cached across the July
  // rollover still advertises the right edition.
  useEffect(() => {
    setYear(computeExerciseYear());
  }, []);

  return (
    <div className="pats-landing" lang={locale} dir={dir}>
      <div className="pats-landing__sky" aria-hidden />
      <div className="pats-landing__emblem-wash" aria-hidden />
      <div className="pats-landing__ridge" aria-hidden />
      <div className="pats-landing__grain" aria-hidden />

      <LandingLanguageSwitcher />

      <main className="pats-landing__stage">
        {/* The crest turns slowly on its vertical axis — two faces so the
            reverse half of the rotation is not a mirror image. */}
        <div className="pats-landing__crest">
          <span className="pats-landing__crest-halo" aria-hidden />
          <span className="pats-landing__crest-spin">
            <span className="pats-landing__crest-face">
              <PatsLogo variant="full" size={132} priority className="pats-landing__crest-img" />
            </span>
            <span className="pats-landing__crest-face pats-landing__crest-face--back" aria-hidden>
              <PatsLogo variant="full" size={132} className="pats-landing__crest-img" />
            </span>
          </span>
        </div>

        {/* Heraldry, not copy — always the original Urdu, in nastaliq, RTL. */}
        <p className="pats-landing__motto pats-urdu-motto" lang="ur" dir="rtl">
          {HERO_MOTTO}
        </p>

        <h1 className="pats-landing__title">
          <span className="pats-landing__title-line">{t.home.hero.titleLine1}</span>
          <span className="pats-landing__title-sub">
            <span>{t.home.hero.titleLine2}</span>
            <span className="pats-landing__title-year">{year}</span>
          </span>
        </h1>

        <span className="pats-landing__rule" aria-hidden />

        <p className="pats-landing__lede">{t.home.hero.description}</p>

        <button
          type="button"
          className="pats-landing__cta"
          onClick={() => setLoginOpen(true)}
        >
          <span>{t.publicSite.nav.login}</span>
          <ArrowRight className="pats-landing__cta-icon" aria-hidden strokeWidth={2} />
        </button>
      </main>

      <LandingLoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
