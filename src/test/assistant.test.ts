import { describe, expect, it } from "vitest";
import { buildPersonalisedGreeting, getFallbackElectionAnswer } from "@/lib/assistant";
import type { UserState } from "@/context/userTypes";
import type { NextStep } from "@/lib/nextStep";

const nextStep: NextStep = {
  id: "registration",
  label: "Register as a voter",
  description: "Fill Form 6 on voters.eci.gov.in.",
  priority: "high",
};

const emptyUser: UserState = {
  completedSteps: [],
  skippedSteps: [],
};

describe("buildPersonalisedGreeting", () => {
  it("falls back to default greeting when no user state is known", () => {
    const greeting = buildPersonalisedGreeting(emptyUser, nextStep, "Welcome to VoteSetu");
    expect(greeting).toBe("Welcome to VoteSetu");
  });

  it("includes status and recommendation when user context exists", () => {
    const user: UserState = {
      ...emptyUser,
      age: 19,
      isRegistered: false,
      hasEpic: false,
    };
    const greeting = buildPersonalisedGreeting(user, nextStep, "Welcome");
    expect(greeting).toContain("Register as a voter");
    expect(greeting).toContain("You haven't registered yet");
    expect(greeting).toContain("EPIC not yet verified");
  });
});

describe("getFallbackElectionAnswer", () => {
  it("returns a registration answer for registration queries", () => {
    expect(getFallbackElectionAnswer("How do I register to vote?")).toContain("Form 6");
  });

  it("returns a domain-bounded generic answer for unknown election queries", () => {
    expect(getFallbackElectionAnswer("Tell me something about elections")).toContain(
      "I can help with voter registration",
    );
  });
});
