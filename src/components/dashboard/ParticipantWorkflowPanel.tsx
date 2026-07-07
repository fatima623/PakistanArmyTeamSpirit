import Link from "next/link";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Lock,
} from "lucide-react";

import type { WorkflowStage } from "@/lib/participant-workflow";
import "@/app/participant-workflow.css";

const STATE_CLASS: Record<WorkflowStage["state"], string> = {
  done: "pwf-step--done",
  current: "pwf-step--current",
  attention: "pwf-step--attention",
  locked: "pwf-step--locked",
};

function StageDot({
  state,
  index,
}: {
  state: WorkflowStage["state"];
  index: number;
}) {
  return (
    <div className="pwf-step__dot" aria-hidden>
      {state === "done" ? (
        <Check strokeWidth={3} />
      ) : state === "locked" ? (
        <Lock />
      ) : state === "attention" ? (
        <AlertTriangle />
      ) : (
        <div>{index + 1}</div>
      )}
    </div>
  );
}

function StageInner({ stage, index }: { stage: WorkflowStage; index: number }) {
  return (
    <div className={`pwf-step ${STATE_CLASS[stage.state]}`}>
      <StageDot state={stage.state} index={index} />
      <div className="pwf-step__text">
        <div className="pwf-step__label">
          <div className="pwf-step__name">{stage.label}</div>
          {stage.href && stage.state !== "locked" ? (
            <ChevronRight aria-hidden />
          ) : null}
        </div>
        <div className="pwf-step__sub">{stage.sub}</div>
      </div>
    </div>
  );
}

/**
 * Guided step-by-step workflow: each stage unlocks only after the previous
 * one completes. Server-rendered from {@link deriveWorkflowStages}.
 *
 * Status colours: green = complete, yellow = pending / in progress,
 * red = needs attention, blue = blocked (not yet unlocked).
 */
export function ParticipantWorkflowPanel({
  stages,
}: {
  stages: WorkflowStage[];
}) {
  const doneCount = stages.filter((s) => s.state === "done").length;
  const pct = Math.round((doneCount / stages.length) * 100);

  return (
    <section className="pwf" aria-label="Registration workflow">
      <div className="pwf__head">
        <h2 className="pwf__title">Your journey</h2>
        <div className="pwf__count">
          <span className="pwf__count-dot" aria-hidden />
          {doneCount} of {stages.length} stages complete
        </div>
      </div>
      <div
        className="pwf__bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Workflow progress"
      >
        <div className="pwf__bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="pwf__grid">
        {stages.map((stage, i) => (
          <li key={stage.key} className="pwf__cell">
            {stage.href && stage.state !== "locked" ? (
              <Link
                href={stage.href}
                aria-label={`${stage.label}: ${stage.sub}`}
              >
                <StageInner stage={stage} index={i} />
              </Link>
            ) : (
              <StageInner stage={stage} index={i} />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
