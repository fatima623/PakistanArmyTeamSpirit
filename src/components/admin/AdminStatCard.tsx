"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Tone = "rose" | "mint" | "amber" | "violet";

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone,
  staggerIndex = 0,
  href,
  series,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: Tone;
  staggerIndex?: number;
  href?: string;
  series?: number[];
}) {
  const [display, setDisplay] = useState(0);
  // Truthful "new this month" delta = latest bucket of the real monthly series.
  const delta = series && series.length ? series[series.length - 1] : 0;
  const sparkMax = series && series.length ? Math.max(...series, 1) : 1;

  useEffect(() => {
    const duration = 1000;
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
      : staggerIndex === 0
        ? "admin-stat-card--delay-0"
        : "";

  const className = `admin-stat-card admin-stat-card--${tone} admin-fade-in-up ${delayClass}`;
  const inner = (
    <>
      <div className="admin-stat-card-body">
        <p className="admin-stat-card-label">{label}</p>
        <p className="admin-stat-card-value" aria-live="polite">
          {display}
          {delta > 0 ? (
            <span className="admin-stat-card-delta">+{delta}</span>
          ) : null}
        </p>
        {series && series.length ? (
          <div className="admin-stat-card-spark" aria-hidden>
            {series.map((v, i) => (
              <span
                key={i}
                style={{ height: `${Math.max(8, Math.round((v / sparkMax) * 100))}%` }}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div
        className={`admin-stat-card-icon admin-stat-card-icon--${tone}`}
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
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
