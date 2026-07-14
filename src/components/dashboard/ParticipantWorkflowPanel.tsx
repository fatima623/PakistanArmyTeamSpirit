import Link from "next/link";
import { AlertTriangle, Check, ChevronRight, Lock } from "lucide-react";

import type { WorkflowStage } from "@/lib/participant-workflow";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const STATE_CLASS: Record<WorkflowStage["state"], string> = {
  done: "pp-step--done",
  current: "pp-step--current",
  attention: "pp-step--attention",
  locked: "pp-step--locked",
};

function StageDot({
  state,
  index,
}: {
  state: WorkflowStage["state"];
  index: number;
}) {
  return (
    <div className="pp-step__dot" aria-hidden>
      {state === "done" ? (
        <Check strokeWidth={3} />
      ) : state === "locked" ? (
        <Lock />
      ) : state === "attention" ? (
        <AlertTriangle />
      ) : (
        index + 1
      )}
    </div>
  );
}

function StageInner({
  stage,
  index,
  clickable,
}: {
  stage: WorkflowStage;
  index: number;
  clickable: boolean;
}) {
  return (
    <div className={`pp-step ${STATE_CLASS[stage.state]}`}>
      <StageDot state={stage.state} index={index} />
      <div className="min-w-0">
        <div className="pp-step__name">
          <span className="truncate">{stage.label}</span>
          {clickable ? <ChevronRight aria-hidden /> : null}
        </div>
        <div className="pp-step__sub">{stage.sub}</div>
      </div>
    </div>
  );
}

/**
 * Guided step-by-step workflow: each stage unlocks only after the previous
 * one completes. Server-rendered from {@link deriveWorkflowStages}.
 *
 * Status colours: green = complete, olive ring = current, amber = needs
 * attention, muted = locked (not yet unlocked).
 */
export function ParticipantWorkflowPanel({
  stages,
  t,
}: {
  stages: WorkflowStage[];
  t: Dictionary["workflowPanel"];
}) {
  const doneCount = stages.filter((s) => s.state === "done").length;
  const pct = Math.round((doneCount / stages.length) * 100);

  return (
    <section className="pp-journey" aria-label={t.ariaLabel}>
      <div className="pp-journey__head">
        <div>

          <h2 className="pp-h2" style={{ marginTop: "0.15rem" }}>
            {t.registrationProgress}
          </h2>
        </div>
        <div className="pp-journey__count">
          <span className="pp-journey__count-dot" aria-hidden />
          {t.countComplete(doneCount, stages.length)}
        </div>
      </div>
      <div
        className="pp-journey__bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.progressAria}
      >
        <div className="pp-journey__fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="pp-journey__grid">
        {stages.map((stage, i) => {
          /* Only the active step (current / needs-attention) links to its
             section and shows hover + a chevron. Completed and locked steps
             render static — no link, no hover animation, no chevron. */
          const isCurrent =
            stage.state === "current" || stage.state === "attention";
          const clickable = isCurrent;
          return (
            <li key={stage.key}>
              {clickable ? (
                <Link
                  href={`/event/journey?step=${stage.key}`}
                  aria-label={`${stage.label}: ${stage.sub}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <StageInner stage={stage} index={i} clickable />
                </Link>
              ) : (
                <StageInner stage={stage} index={i} clickable={false} />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
