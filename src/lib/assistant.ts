// Simplified assistant library — logic moved to Gemini.
// Phase 11: Cleaned up local mock data.

import type { UserState } from "@/context/userTypes";
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

export function getFallbackElectionAnswer(input: string): string {
  const q = input.toLowerCase();

  if (q.includes("register") || q.includes("form 6")) {
    return "To register, fill Form 6 on voters.eci.gov.in. You need to be 18 or older, an Indian citizen, and ordinarily resident in your constituency.";
  }

  if (q.includes("epic") || q.includes("voter id") || q.includes("e-epic")) {
    return "Your voter ID is called EPIC. If you are already registered, you can search for your record and download e-EPIC from voters.eci.gov.in.";
  }

  if (q.includes("booth") || q.includes("polling station") || q.includes("where to vote")) {
    return "Use the official Electoral Search or Voter Services Portal to find your polling booth, part number, and serial number before polling day.";
  }

  if (q.includes("vvpat") || q.includes("evm")) {
    return "On polling day, you vote on an EVM and verify the VVPAT slip for 7 seconds. The slip confirms the candidate name and symbol you selected.";
  }

  if (q.includes("nota")) {
    return "NOTA lets you reject all listed candidates. It is counted and announced, but it does not trigger a re-poll by itself.";
  }

  if (q.includes("id") || q.includes("document") || q.includes("aadhaar")) {
    return "Carry your EPIC if possible. If you do not have it, ECI usually allows alternative photo IDs such as Aadhaar, passport, PAN card, or driving licence, subject to the notified list.";
  }

  if (q.includes("counting") || q.includes("result")) {
    return "Counting usually starts with postal ballots and then EVM rounds. Official results are published by the Election Commission after verification.";
  }

  return "I can help with voter registration, EPIC, polling booths, EVM and VVPAT, accepted IDs, election phases, and polling-day steps. Ask a specific election question and I will guide you.";
}

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
      user.hasEpic ? "✅ Your EPIC (Voter ID) is confirmed" : "❌ EPIC not yet verified",
    );
  }

  const statusBlock =
    statusLines.length > 0 ? `\n\nHere's your current status:\n${statusLines.join("\n")}` : "";

  return (
    `Namaste! 🙏 Based on your current progress, here's what you should do next:\n\n` +
    `**${nextStep.label}** — ${nextStep.description}${statusBlock}\n\n` +
    `Feel free to ask me anything about Indian elections!`
  );
}
