import {
  Children,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Accessible name for the card list */
  ariaLabel: string;
  /** Desktop column count when all cards fit one row (e.g. 4 pillars) */
  columns?: 2 | 3 | 4;
  className?: string;
};

/** Symmetric forest cards in a responsive grid — no carousel arrows. */
export function ForestCardGrid({
  children,
  ariaLabel,
  columns = 4,
  className,
}: Props) {
  const items = Children.toArray(children).filter(Boolean) as ReactElement[];

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "forest-card-grid",
        columns === 4 && "forest-card-grid--4",
        columns === 3 && "forest-card-grid--3",
        columns === 2 && "forest-card-grid--2",
        className
      )}
      role="list"
      aria-label={ariaLabel}
    >
      {items.map((child, index) => (
        <div
          key={child.key ?? `forest-grid-${index}`}
          role="listitem"
          className="forest-card-grid__cell"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
