"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type AnchorItem = { id: string; label: string };

type Props = {
  items: AnchorItem[];
  ariaLabel: string;
};

/**
 * Sticky in-page section rail. The familiarization brief is one long page by
 * design (single nav heading), so this is how a contingent jumps straight to
 * the part it needs.
 *
 * Active state comes from IntersectionObserver rather than scroll maths, and
 * the observer band is biased toward the top of the viewport so the highlighted
 * link matches the heading the reader is actually looking at.
 */
export function FamiliarizationAnchorNav({ items, ariaLabel }: Props) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="fam-anchor-nav" aria-label={ariaLabel}>
      <div className="fam-anchor-nav__inner">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "fam-anchor-nav__link",
              active === item.id && "fam-anchor-nav__link--active"
            )}
            aria-current={active === item.id ? "true" : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
