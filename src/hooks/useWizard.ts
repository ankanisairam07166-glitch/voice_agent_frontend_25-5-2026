/**
 * useWizard — encapsulates all shared state for the 6-step onboarding wizard.
 */

import { useState, useCallback } from "react";
import type { Job, WizardState } from "../types";

const INITIAL: WizardState = {
  currentStep: 1,
  resumeId: null,
  resumeFilename: null,
  parsedSkills: [],
  selectedJob: null,
  email: "",
  devOtp: undefined,
  sessionToken: "",
};

export interface WizardActions {
  goTo: (step: number) => void;
  onResumeUploaded: (id: string, filename: string, skills: string[]) => void;
  onJobSelected: (job: Job) => void;
  onJobReviewed: () => void;
  onOTPSent: (email: string, devOtp?: string) => void;
  onOTPVerified: (token: string) => void;
}

export function useWizard(): [WizardState, WizardActions] {
  const [state, setState] = useState<WizardState>(INITIAL);

  const goTo = useCallback((step: number) => {
    setState((s) => ({ ...s, currentStep: step }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const actions: WizardActions = {
    goTo,
    onResumeUploaded(resumeId, resumeFilename, parsedSkills) {
      setState((s) => ({ ...s, resumeId, resumeFilename, parsedSkills }));
      goTo(2);
    },
    onJobSelected(job) {
      setState((s) => ({ ...s, selectedJob: job }));
      goTo(3);
    },
    onJobReviewed() { goTo(4); },
    onOTPSent(email, devOtp) {
      setState((s) => ({ ...s, email, devOtp }));
      goTo(5);
    },
    onOTPVerified(sessionToken) {
      setState((s) => ({ ...s, sessionToken }));
      goTo(6);
    },
  };

  return [state, actions];
}
