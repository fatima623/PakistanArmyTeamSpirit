"use client";

import { useEffect, useRef, useState } from "react";

import { PatsSection } from "@/components/pats/PatsSection";
import { ARMY_STATS } from "@/lib/army-content";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    const start = performance.now();
    let frame: number;

    const update = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(update);
      } else {
        setValue(target);
      }
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}

function StatItem({
  value,
  suffix,
  label,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  active: boolean;
}) {
  const count = useCountUp(value, active);

  return (
    <div className="pats-stat">
      <p className="pats-stat__value tabular-nums">
        {count}
        {suffix}
      </p>
      <p className="pats-stat__label">{label}</p>
    </div>
  );
}

export function StatsBar({ className }: { className?: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry?.isIntersecting ?? false);
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      setActive(true);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <PatsSection
      variant="stats"
      className={cn("scroll-deck-layer !py-0", className)}
    >
      <div ref={ref} className="pats-stats">
        {ARMY_STATS.map((stat, i) => {
          const localized = t.home.stats[i];
          return (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={localized?.suffix ?? stat.suffix}
              label={localized?.label ?? stat.label}
              active={active}
            />
          );
        })}
      </div>
    </PatsSection>
  );
}
