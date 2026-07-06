"use client";

import Link from "next/link";

import type { MetaItem } from "@/components/cinematic/HudMetaStrip";
import { PATS_CROP } from "@/lib/media";
import { cn } from "@/lib/utils";

import { PageHeroBackdrop } from "./PageHeroBackdrop";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  meta?: MetaItem[];
  className?: string;
};

/** PAF-style compact page banner — not full-viewport; content follows on lighter band. */
export function PatsPageHero({
  eyebrow,
  title,
  subtitle,
  meta = [],
  className,
}: Props) {
  return (
    <header className={cn("pats-page-hero pats-page-hero--banner", className)}>
      <div className="pats-page-hero__stage">
        <PageHeroBackdrop
          src={PATS_CROP.pageHeroInner38}
          className="pats-page-hero__media"
        />
        <div className="pats-page-hero__overlay" aria-hidden />
        <div className="pats-page-hero__content">
          <p className="pats-eyebrow">{eyebrow}</p>
          <div className="pats-gold-rule" aria-hidden />
          <h1 className="pats-page-hero__title">{title}</h1>
          {subtitle && (
            <p className="pats-body pats-body--bright mt-2 max-w-2xl text-sm sm:text-base">
              {subtitle}
            </p>
          )}
          <nav className="pats-page-hero__crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <span>{title}</span>
          </nav>
        </div>
      </div>
      {meta.length > 0 ? (
        <dl className="pats-page-hero__meta">
          {meta.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </header>
  );
}
