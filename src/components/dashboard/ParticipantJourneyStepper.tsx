import { Fragment } from "react";
import { Check } from "lucide-react";

type StepState = "done" | "current" | "upcoming";

/**
 * Application → Payment → Confirmed journey stepper (participant dashboard),
 * matching the portal mockup. Driven by the resolved journey stage (1/2/3).
 */
export function ParticipantJourneyStepper({
  stage,
}: {
  stage: 1 | 2 | 3;
}) {
  const steps: { n: number; label: string; sub: string; state: StepState }[] = [
    {
      n: 1,
      label: "Application",
      state: stage > 1 ? "done" : "current",
      sub: stage > 1 ? "Approved" : "Under review",
    },
    {
      n: 2,
      label: "Payment",
      state: stage < 2 ? "upcoming" : stage === 2 ? "current" : "done",
      sub: stage < 2 ? "Locked" : stage === 2 ? "Required" : "Verified",
    },
    {
      n: 3,
      label: "Confirmed",
      state: stage === 3 ? "done" : "upcoming",
      sub: stage === 3 ? "Cleared for PATS 2026" : "Pending",
    },
  ];

  return (
    <div className="portal-stepper" aria-label="Registration journey">
      {steps.map((s, i) => (
        <Fragment key={s.n}>
          <div className={`portal-stepper__step portal-stepper__step--${s.state}`}>
            <span className="portal-stepper__dot" aria-hidden>
              {s.state === "done" ? <Check className="h-4 w-4" /> : s.n}
            </span>
            <span className="portal-stepper__text">
              <span className="portal-stepper__label">{s.label}</span>
              <span className="portal-stepper__sub">{s.sub}</span>
            </span>
          </div>
          {i < steps.length - 1 ? (
            <span
              className={`portal-stepper__line${
                steps[i + 1].state !== "upcoming" ? " portal-stepper__line--filled" : ""
              }`}
              aria-hidden
            />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
