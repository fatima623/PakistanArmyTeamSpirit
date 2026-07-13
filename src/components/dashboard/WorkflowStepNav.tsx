import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LayoutDashboard, Lock } from "lucide-react";

import type { WorkflowStage } from "@/lib/participant-workflow";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function stepHref(key: string): string {
  return `/event/journey?step=${key}`;
}

/**
 * Section-to-section navigation shown at the foot of each registration module.
 *
 * Replaces the old single-wizard stepper: the dashboard is the hub, and each
 * module simply offers a direct "Next" jump to the following section once it is
 * complete (the next stage unlocks only after the current one is done), plus a
 * clear route back to the dashboard.
 */
export function WorkflowStepNav({
  stages,
  activeKey,
  wizard,
  common,
}: {
  stages: WorkflowStage[];
  activeKey: string;
  wizard: Dictionary["journey"]["wizard"];
  common: Dictionary["common"];
}) {
  const activeIndex = Math.max(
    0,
    stages.findIndex((s) => s.key === activeKey)
  );
  const active = stages[activeIndex];
  const prev = activeIndex > 0 ? stages[activeIndex - 1] : null;
  const next =
    activeIndex < stages.length - 1 ? stages[activeIndex + 1] : null;
  const nextUnlocked = !!next && next.state !== "locked";

  return (
    <nav className="pp-stepnav" aria-label={wizard.stepsAria}>
      <div className="pp-stepnav__group">
        <Link href="/event/dashboard" className="pp-stepnav__ghost">
          <LayoutDashboard className="h-4 w-4" aria-hidden />
          {common.backToDashboard}
        </Link>
        {prev ? (
          <Link href={stepHref(prev.key)} className="pp-stepnav__ghost">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {common.back}
          </Link>
        ) : null}
      </div>

      <p className="pp-stepnav__progress">
        {wizard.stepXofY(
          activeIndex + 1,
          stages.length,
          active ? active.label : ""
        )}
      </p>

      <div className="pp-stepnav__group pp-stepnav__group--end">
        {next ? (
          nextUnlocked ? (
            <Link
              href={stepHref(next.key)}
              className="pp-stepnav__next"
              aria-label={`${common.next}: ${next.label}`}
            >
              {common.next}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span
              className="pp-stepnav__next pp-stepnav__next--locked"
              title={wizard.nextLockedTitle}
            >
              <Lock className="h-3.5 w-3.5" aria-hidden />
              {common.next}
            </span>
          )
        ) : (
          <span className="pp-stepnav__done" title={wizard.finalStepTitle}>
            <Check className="h-4 w-4" aria-hidden />
            {wizard.finalStep}
          </span>
        )}
      </div>
    </nav>
  );
}
