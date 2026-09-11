"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { MetaItem } from "@/components/cinematic/HudMetaStrip";
import { useI18nOptional } from "@/lib/i18n/I18nProvider";
import { PATS_CROP } from "@/lib/media";
import { TOUR_HOME, pathnameIsTourPage } from "@/lib/tour-navigation";
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
  const i18n = useI18nOptional();
  const crumb = i18n?.t.publicSite.breadcrumb;
  // Inside the tour, "Home" is the tour index (the former public home page) —
  // `/` is now the bare landing screen, which would drop the visitor back out
  // of the site they are already signed in to.
  const pathname = usePathname() ?? "";
  const homeHref = pathnameIsTourPage(pathname) ? TOUR_HOME : "/";
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
          <nav
            className="pats-page-hero__crumb"
            aria-label={crumb?.label ?? "Breadcrumb"}
          >
            <Link href={homeHref}>{crumb?.home ?? "Home"}</Link>
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
