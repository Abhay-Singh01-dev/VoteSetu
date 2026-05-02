/**
 * UserInsights Engine — Proactive Predictive Logic
 *
 * Fully deterministic, pure function. No UI, no side-effects, no async calls.
 * Evaluates raw UserState to compute confidence scores, risks, suggestions, and urgency.
 */

import type { UserState } from "@/context/UserContext";
import { getNextStep } from "./nextStep";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SeverityLevel = "info" | "warning" | "critical";

export type UserInsight = {
  nextStepId: string;
  risks: { message: string; severity: SeverityLevel }[];
  suggestions: string[];
  urgency: SeverityLevel;
  confidenceScore: number; // 0 to 100
};

// ---------------------------------------------------------------------------
// Engine Logic
// ---------------------------------------------------------------------------

/**
 * Derives deep insights from the user's current state.
 */
export function getUserInsights(user: UserState): UserInsight {
  const nextStep = getNextStep(user);
  
  const risks: { message: string; severity: SeverityLevel }[] = [];
  const suggestions: string[] = [];
  let urgency: SeverityLevel = "info";
  let confidenceScore = 0;

  // 1. Calculate base confidence score based on critical milestones
  // We weight registration and EPIC possession as the anchor points.
  if (user.age !== undefined && user.age >= 18) confidenceScore += 10;
  if (user.isRegistered) confidenceScore += 40;
  if (user.hasEpic) confidenceScore += 30;
  
  // Remaining 20 points from explicitly tracking timeline completion
  // E.g. finding a booth, or marking step 4/5/6 as complete
  const otherSteps = user.completedSteps.filter(s => ["4", "5", "6"].includes(s));
  confidenceScore += Math.min(20, otherSteps.length * 7);

  // Normalize confidence (cap at 100)
  confidenceScore = Math.min(100, Math.max(0, confidenceScore));

  // 2. Risk Evaluation (Max 3 core risks)
  
  // Risk A: Underage (Absolute blocker)
  if (user.age !== undefined && user.age < 18) {
    risks.push({
      message: `You are ${user.age} years old — you must be 18+ to vote.`,
      severity: "warning"
    });
  }

  // Risk B: Not Registered (Critical blocker)
  if (user.isRegistered === false) {
    risks.push({
      message: "You are not on the electoral roll. Registration implies a waiting period.",
      severity: "critical"
    });
    urgency = "critical";
  }

  // Risk C: Missing EPIC / Incomplete Prep (Medium severity)
  if (user.isRegistered && user.hasEpic === false) {
    risks.push({
      message: "You lack a verified EPIC. You must locate an alternative ID.",
      severity: "warning"
    });
    if (urgency !== "critical") urgency = "warning";
  }

  // Risk D: Repeated inaction / Skip behavior (from Interaction Memory)
  if (user.skippedSteps && user.skippedSteps.includes(nextStep.id)) {
    if (risks.length < 3) {
      risks.push({
        message: `You previously skipped "${nextStep.label}". Delaying this might cause issues on polling day.`,
        severity: "info",
      });
    }
  }

  // Cap risks to 3 as per constraints
  const finalRisks = risks.slice(0, 3);

  // 3. Suggestions Generation (Max 2 suggestions)
  if (user.isRegistered === false) {
    suggestions.push("File Form 6 online via the Voter Services Portal immediately.");
  } else if (user.isRegistered && !user.hasEpic) {
    suggestions.push("Download your e-EPIC or ensure you have Aadhaar/PAN ready.");
  }

  if (suggestions.length < 2 && user.skippedSteps?.length > 0) {
    suggestions.push("Review skipped steps to ensure you don't miss critical deadlines.");
  }

  if (suggestions.length < 2 && confidenceScore === 100) {
    suggestions.push("You're fully prepared! Help family members check their status.");
  }

  const finalSuggestions = suggestions.slice(0, 2);

  // Determine global urgency derived from highest risk severity, or default to info.
  // We already escalated urgency to critical/warning if core risks fired.

  return {
    nextStepId: nextStep.id,
    risks: finalRisks,
    suggestions: finalSuggestions,
    urgency,
    confidenceScore,
  };
}
