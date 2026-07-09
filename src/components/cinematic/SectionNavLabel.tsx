"use client";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  /** In-page anchor, e.g. `#about` */
  href?: string;
  className?: string;
};

export function SectionNavLabel({ label, href, className }: Props) {
  const classes = cn("cinematic-section-label", className);

  const inner = (
    <>
      <span className="relative z-[1]">{label}</span>
      <span
        className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-brass transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </>
  );

  if (href) {
    return (
      <a href={href} className={cn(classes, "group")}>
        {inner}
      </a>
    );
  }

  return <span className={cn(classes, "group")}>{inner}</span>;
}
