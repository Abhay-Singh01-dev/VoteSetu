import { describe, expect, it } from "vitest";
import { getNextStep, isStepComplete } from "@/lib/nextStep";
import type { UserState } from "@/context/UserContext";

const baseUser: UserState = {
  completedSteps: [],
  skippedSteps: [],
};

describe("next step engine", () => {
  it("prioritizes registration when user is not registered", () => {
    const step = getNextStep({ ...baseUser, age: 22, isRegistered: false });
    expect(step.id).toBe("registration");
    expect(step.priority).toBe("high");
  });

  it("returns EPIC step when registered but EPIC is missing", () => {
    const step = getNextStep({ ...baseUser, age: 25, isRegistered: true, hasEpic: false });
    expect(step.id).toBe("epic");
  });

  it("returns booth step when user is fully prepared", () => {
    const step = getNextStep({ ...baseUser, age: 26, isRegistered: true, hasEpic: true });
    expect(step.id).toBe("booth");
  });
});

describe("isStepComplete", () => {
  it("derives completion for eligibility and registration", () => {
    const user: UserState = {
      ...baseUser,
      age: 20,
      isRegistered: true,
      hasEpic: false,
    };
    expect(isStepComplete(1, user)).toBe(true);
    expect(isStepComplete(2, user)).toBe(true);
    expect(isStepComplete(3, user)).toBe(false);
  });

  it("honors manually completed steps", () => {
    const user: UserState = {
      ...baseUser,
      completedSteps: ["5"],
    };
    expect(isStepComplete(5, user)).toBe(true);
  });
});
