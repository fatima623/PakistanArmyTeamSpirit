"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

type Tone = "rose" | "mint" | "amber" | "violet";

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone,
  staggerIndex = 0,
  href,
  series,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: Tone;
  staggerIndex?: number;
  href?: string;
  series?: number[];
  variant?: "default" | "feature";
}) {
  const [display, setDisplay] = useState(0);
  // Truthful "new this month" delta = latest bucket of the real monthly series.
  const delta = series && series.length ? series[series.length - 1] : 0;
  const isFeature = variant === "feature";
  const deltaPositive = delta >= 0;

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(eased * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const delayClass =
    staggerIndex > 0 && staggerIndex <= 4
      ? `admin-stat-card--delay-${staggerIndex}`
      : "admin-stat-card--delay-0";

  const className = [
    "admin-stat-card",
    isFeature ? "admin-stat-card--feature" : `admin-stat-card--${tone}`,
    "admin-fade-in-up",
    delayClass,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <div className="admin-stat-top">
        <span
          className={`admin-stat-card-icon admin-stat-card-icon--${tone}`}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        {delta !== 0 ? (
          <span
            className={`admin-stat-pill ${
              deltaPositive ? "admin-stat-pill--up" : "admin-stat-pill--down"
            }`}
          >
            {deltaPositive ? (
              <TrendingUp className="h-3 w-3" aria-hidden />
            ) : (
              <TrendingDown className="h-3 w-3" aria-hidden />
            )}
            {deltaPositive ? "+" : ""}
            {delta}
          </span>
        ) : null}
      </div>
      <p className="admin-stat-card-value" aria-live="polite">
        {display}
      </p>
      <p className="admin-stat-card-label">{label}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} admin-stat-card--link`}
        aria-label={`${label}: ${value}. View list`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
