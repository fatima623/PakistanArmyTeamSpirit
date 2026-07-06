import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "default" | "gold";
  className?: string;
  ariaLabel?: string;
};

export function ArmyButton({
  href,
  children,
  variant = "default",
  className,
  ariaLabel,
}: Props) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "army-btn",
        variant === "gold" && "army-btn--gold",
        className
      )}
      aria-label={ariaLabel}
    >
      <span>{children}</span>
    </Link>
  );
}
