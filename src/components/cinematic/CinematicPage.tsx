import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Inner public pages — glass panel on tactical background */
export function CinematicPage({ children, className }: Props) {
  return (
    <article
      className={cn(
        "pats-prose-panel cinematic-prose mx-auto max-w-4xl",
        className
      )}
    >
      {children}
    </article>
  );
}
