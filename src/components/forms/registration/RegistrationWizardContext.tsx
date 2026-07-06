"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  REGISTRATION_STEP,
  type RegistrationStatus,
  REGISTRATION_STATUS,
  TEAM_TYPE,
  type TeamTypeCode,
} from "@/lib/compliance/constants";

export type TeamMemberDraft = {
  memberName: string;
  rankLabel: string;
  healthStatus: "PENDING" | "CLEARED" | "FLAGGED";
};

export type RegistrationDraft = {
  originCountry: string;
  teamTypeCode: TeamTypeCode;
  cityStation: string;
  primaryContactEmail: string;
  secondaryContactEmail: string;
  roster: TeamMemberDraft[];
  accommodationNotes: string;
  equipmentNotes: string;
  liaisonContactName: string;
  liaisonContactEmail: string;
  liaisonContactPhone: string;
  liaisonAware: boolean;
  extActivityRequested: boolean;
  extActivityDays: number | null;
  additionalInfo: string;
  status: RegistrationStatus;
};

const initialDraft: RegistrationDraft = {
  originCountry: "",
  teamTypeCode: TEAM_TYPE.TYPE_A,
  cityStation: "",
  primaryContactEmail: "",
  secondaryContactEmail: "",
  roster: [],
  accommodationNotes: "",
  equipmentNotes: "",
  liaisonContactName: "",
  liaisonContactEmail: "",
  liaisonContactPhone: "",
  liaisonAware: false,
  extActivityRequested: false,
  extActivityDays: null,
  additionalInfo: "",
  status: REGISTRATION_STATUS.DRAFT,
};

type ContextValue = {
  step: number;
  draft: RegistrationDraft;
  setStep: (step: number) => void;
  updateDraft: (patch: Partial<RegistrationDraft>) => void;
  nextStep: () => void;
  prevStep: () => void;
  maxStep: number;
};

const RegistrationWizardContext = createContext<ContextValue | null>(null);

export function RegistrationWizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<number>(REGISTRATION_STEP.TEAM_INFO);
  const [draft, setDraft] = useState<RegistrationDraft>(initialDraft);

  const updateDraft = useCallback((patch: Partial<RegistrationDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, REGISTRATION_STEP.COMPLIANCE));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, REGISTRATION_STEP.TEAM_INFO));
  }, []);

  const value = useMemo(
    () => ({
      step,
      draft,
      setStep,
      updateDraft,
      nextStep,
      prevStep,
      maxStep: REGISTRATION_STEP.COMPLIANCE,
    }),
    [step, draft, updateDraft, nextStep, prevStep]
  );

  return (
    <RegistrationWizardContext.Provider value={value}>
      {children}
    </RegistrationWizardContext.Provider>
  );
}

export function useRegistrationWizard() {
  const ctx = useContext(RegistrationWizardContext);
  if (!ctx) {
    throw new Error("useRegistrationWizard must be used within RegistrationWizardProvider");
  }
  return ctx;
}
