// Simplified assistant library — logic moved to Gemini.
// Phase 11: Cleaned up local mock data.

import type { UserState } from "@/context/UserContext";
import type { NextStep } from "@/lib/nextStep";

export type CitationSource = { label: string; href: string };

export const suggestedQuestions = [
  "How do I register to vote?",
  "What is VVPAT?",
  "Where do I find my polling booth?",
  "Can NRIs vote in Indian elections?",
  "What is the Model Code of Conduct?",
  "What documents can I carry to vote?",
];

export type AssistantReply = { answer: string; sources?: CitationSource[] };

/**
 * Builds a personalised opening message by injecting the user's current
 * next-step into the standard greeting. Falls back gracefully when no
 * meaningful user state is present.
 */
export function buildPersonalisedGreeting(
  user: UserState,
  nextStep: NextStep,
  defaultGreeting: string,
): string {
  // Determine how much we know about the user
  const hasAnyState =
    user.isRegistered !== undefined ||
    user.hasEpic !== undefined ||
    user.age !== undefined ||
    user.completedSteps.length > 0;

  if (!hasAnyState) {
    // No personalisation data yet — return the standard i18n greeting
    return defaultGreeting;
  }

  // Build status snippet
  const statusLines: string[] = [];

  if (user.age !== undefined) {
    statusLines.push(
      user.age >= 18
        ? `✅ Age eligibility — you're ${user.age}, eligible to vote`
        : `⚠️ Age — you're ${user.age}, not yet eligible (must be 18+ on 1st Jan)`,
    );
  }
  if (user.isRegistered !== undefined) {
    statusLines.push(
      user.isRegistered
        ? "✅ You're registered on the electoral roll"
        : "❌ You haven't registered yet",
    );
  }
  if (user.hasEpic !== undefined) {
    statusLines.push(
      user.hasEpic
        ? "✅ Your EPIC (Voter ID) is confirmed"
        : "❌ EPIC not yet verified",
    );
  }

  const statusBlock =
    statusLines.length > 0
      ? `\n\nHere's your current status:\n${statusLines.join("\n")}`
      : "";

  return (
    `Namaste! 🙏 Based on your current progress, here's what you should do next:\n\n` +
    `**${nextStep.label}** — ${nextStep.description}${statusBlock}\n\n` +
    `Feel free to ask me anything about Indian elections!`
  );
}
