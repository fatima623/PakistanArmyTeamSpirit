"use client";

import { REGISTRATION_STEP_LABELS } from "@/lib/compliance/constants";
import { cn } from "@/lib/utils";

import {
  RegistrationWizardProvider,
  useRegistrationWizard,
} from "./RegistrationWizardContext";

function StepIndicator() {
  const { step, setStep, maxStep } = useRegistrationWizard();

  return (
    <nav aria-label="Registration progress" className="mb-12">
      <ol className="flex items-center gap-0">
        {Array.from({ length: maxStep }, (_, i) => i + 1).map((n) => (
          <li key={n} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setStep(n)}
              className="flex flex-col items-center"
              aria-current={step === n ? "step" : undefined}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center border font-mono text-[11px] font-medium tracking-[0.08em] transition-all duration-300",
                  n < step
                    ? "border-accent-gold bg-accent-gold text-black"
                    : n === step
                      ? "border-accent-gold bg-transparent text-white"
                      : "border-white/20 bg-transparent text-white/30"
                )}
              >
                {n < step ? "✓" : String(n).padStart(2, "0")}
              </div>
              <span
                className={cn(
                  "mt-1.5 whitespace-nowrap font-body text-[10px] uppercase tracking-[0.12em]",
                  n === step ? "text-accent-gold" : "text-white/35"
                )}
              >
                {REGISTRATION_STEP_LABELS[n]}
              </span>
            </button>
            {n < maxStep && (
              <div
                className={cn(
                  "mx-2 mb-5 h-px flex-1 transition-all duration-500",
                  n < step ? "bg-accent-gold" : "bg-white/15"
                )}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function WizardBody() {
  const { step, nextStep, prevStep } = useRegistrationWizard();

  return (
    <div className="paf-form-panel p-8 md:p-12">
      <div className="mb-6">
        <p className="paf-label mb-1">Registration</p>
        <h2 className="font-display text-2xl font-bold uppercase tracking-[0.06em] text-white">
          Team application
        </h2>
        <div className="mt-3 h-px w-12 bg-accent-gold" aria-hidden />
      </div>
      <StepIndicator />
      <div className="min-h-[12rem]">
        {step === 1 && (
          <p className="paf-body text-sm">
            Step 1 — Team information (origin, type, contacts). Wire to{" "}
            <code className="font-mono text-xs text-accent-gold">
              RegistrationForm
            </code>{" "}
            fields.
          </p>
        )}
        {step === 2 && (
          <p className="paf-body text-sm">
            Step 2 — Roster and requirements checklist.
          </p>
        )}
        {step === 3 && (
          <p className="paf-body text-sm">
            Step 3 — Travel documents and liaison contact.
          </p>
        )}
        {step === 4 && (
          <p className="paf-body text-sm">
            Step 4 — Compliance upload and submission summary.
          </p>
        )}
      </div>
      <div className="mt-8 flex justify-between gap-4 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className="border border-white/40 px-6 py-3 font-body text-[12px] font-medium uppercase tracking-military text-white transition-colors hover:border-white hover:bg-white/10 disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={step === 4}
          className="group relative overflow-hidden border border-white/60 px-8 py-3.5 font-body text-[12px] font-medium uppercase tracking-military text-white transition-all hover:border-white disabled:opacity-40"
        >
          <span className="absolute inset-0 translate-x-[-101%] bg-accent-gold/20 transition-transform duration-300 ease-out group-hover:translate-x-0" />
          <span className="relative z-10">Continue</span>
        </button>
      </div>
    </div>
  );
}

/** Four-step registration shell — connect to existing Unit/User APIs */
export function RegistrationWizard() {
  return (
    <RegistrationWizardProvider>
      <WizardBody />
    </RegistrationWizardProvider>
  );
}
