"use client";

import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type Props = {
  /** Nav bar: compact primary. Inline: secondary for page headers. */
  variant?: "nav" | "inline";
  className?: string;
};

export function LogoutButton({ variant = "inline", className }: Props) {
  return (
    <form action={logoutAction} className={className}>
      <button
        type="submit"
        className={cn(
          variant === "nav"
            ? undefined
            : cn("ops-btn", "ops-btn-secondary ops-btn-sm")
        )}
      >
        Log out
      </button>
    </form>
  );
}
