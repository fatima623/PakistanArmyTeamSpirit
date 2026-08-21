import { memo } from "react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RegistrationProgress } from "@/lib/registration-progress";

/**
 * "3/5 · Team Members" — the participant's position in the guided registration,
 * shown wherever staff track a team. Reads the same derivation the participant's
 * own progress panel does.
 */
export const RegistrationProgressBadge = memo(
  function RegistrationProgressBadge({
    progress,
    className,
    /** Compact table density: counter + label on one line. */
    density = "default",
  }: {
    progress: RegistrationProgress;
    className?: string;
    density?: "default" | "table";
  }) {
    const { done, total, currentLabel, approved, readyForApproval } = progress;
    const tone = approved
      ? "admin-overall-badge--approved"
      : readyForApproval
        ? "admin-overall-badge--review"
        : "admin-overall-badge--pending";

    return (
      <span
        className={cn(
          "admin-overall-badge",
          tone,
          density === "table" && "whitespace-nowrap",
          className
        )}
        title={
          approved
            ? "Approved by the SD"
            : `Step ${progress.currentStep} of ${total} — ${currentLabel}`
        }
      >
        {approved ? <CheckCircle2 aria-hidden /> : null}
        <span className="tabular-nums">
          {done}/{total}
        </span>
        <span aria-hidden>·</span>
        {currentLabel}
      </span>
    );
  }
);
