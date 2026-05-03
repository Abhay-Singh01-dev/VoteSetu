/**
 * nextStep — pure next-step-engine
 *
 * Given the current UserState, returns the single highest-priority action
 * the user should take in their voter journey.
 *
 * No UI, no side-effects, no external dependencies.
 */

import type { UserState } from "@/context/userTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StepPriority = "high" | "medium" | "low";

export type NextStep = {
  /** Stable machine-readable identifier that maps to a voter-journey step */
  id: string;
  /** Short human-readable label (English) */
  label: string;
  /** One-sentence description of what to do and why */
  description: string;
  /** Urgency level */
  priority: StepPriority;
};

// ---------------------------------------------------------------------------
// Step definitions (English fallback — components can localise labels)
// ---------------------------------------------------------------------------

const STEPS = {
  eligibility: {
    id: "eligibility",
    label: "Check your eligibility",
    description:
      "Confirm you are 18+ on 1st January of the election year and an Indian citizen resident in your constituency.",
    priority: "high" as StepPriority,
  },
  registration: {
    id: "registration",
    label: "Register as a voter",
    description:
      "Your name is not on the electoral roll yet. Fill Form 6 on voters.eci.gov.in to register.",
    priority: "high" as StepPriority,
  },
  epic: {
    id: "epic",
    label: "Get your Voter ID (EPIC)",
    description:
      "You are registered but haven't verified your EPIC. Download your e-EPIC from voters.eci.gov.in.",
    priority: "medium" as StepPriority,
  },
  booth: {
    id: "booth",
    label: "Find your polling booth",
    description:
      "All set! Use the 'Know Your Polling Station' tool on voters.eci.gov.in to locate your booth.",
    priority: "low" as StepPriority,
  },
} as const;

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/**
 * Returns the single most-important next step for the given user state.
 * Rules are evaluated in strict priority order — first matching rule wins.
 */
export function getNextStep(user: UserState): NextStep {
  // 1. Under-age or age unknown → eligibility first
  if (user.age !== undefined && user.age < 18) {
    return STEPS.eligibility;
  }

  // 2. Not registered (or registration status unknown) → registration
  if (!user.isRegistered) {
    return STEPS.registration;
  }

  // 3. Registered but no EPIC confirmed → get EPIC
  if (!user.hasEpic) {
    return STEPS.epic;
  }

  // 4. All clear → find polling booth
  return STEPS.booth;
}

// ---------------------------------------------------------------------------
// Helpers for VoterJourney step completion
// ---------------------------------------------------------------------------

/**
 * Returns true when a given numeric journey step (1-6) should be considered
 * complete based on the user's persisted state.
 *
 * Fall-through: also checks the `completedSteps` array so manual toggles
 * are respected even when derived state would disagree.
 */
export function isStepComplete(stepId: number, user: UserState): boolean {
  const idStr = String(stepId);
  if (user.completedSteps.includes(idStr)) return true;

  switch (stepId) {
    case 1:
      // Eligibility — known age and 18+
      return user.age !== undefined && user.age >= 18;
    case 2:
      // Registration
      return user.isRegistered === true;
    case 3:
      // EPIC
      return user.hasEpic === true;
    // Steps 4-6 are manual-only (no derived state available)
    default:
      return false;
  }
}
