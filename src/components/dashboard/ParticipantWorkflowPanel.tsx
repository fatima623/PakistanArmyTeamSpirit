import Link from "next/link";
import { AlertTriangle, Check, ChevronRight, Lock } from "lucide-react";

import type { WorkflowStage } from "@/lib/participant-workflow";

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

function StageInner({ stage, index }: { stage: WorkflowStage; index: number }) {
  return (
    <div className={`pp-step ${STATE_CLASS[stage.state]}`}>
      <StageDot state={stage.state} index={index} />
      <div className="min-w-0">
        <div className="pp-step__name">
          <span className="truncate">{stage.label}</span>
          {stage.href && stage.state !== "locked" ? (
            <ChevronRight aria-hidden />
          ) : null}
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
}: {
  stages: WorkflowStage[];
}) {
  const doneCount = stages.filter((s) => s.state === "done").length;
  const pct = Math.round((doneCount / stages.length) * 100);

  return (
    <section className="pp-journey" aria-label="Registration workflow">
      <div className="pp-journey__head">
        <div>
          
          <h2 className="pp-h2" style={{ marginTop: "0.15rem" }}>
            Registration progress
          </h2>
        </div>
        <div className="pp-journey__count">
          <span className="pp-journey__count-dot" aria-hidden />
          {doneCount} of {stages.length} complete
        </div>
      </div>
      <div
        className="pp-journey__bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Workflow progress"
      >
        <div className="pp-journey__fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="pp-journey__grid">
        {stages.map((stage, i) => (
          <li key={stage.key}>
            {stage.href && stage.state !== "locked" ? (
              <Link href={stage.href} aria-label={`${stage.label}: ${stage.sub}`}>
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
