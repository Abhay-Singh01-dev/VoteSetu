import { describe, expect, it } from "vitest";
import { getUserInsights } from "@/lib/userInsights";
import type { UserState } from "@/context/userTypes";

const baseUser: UserState = {
  completedSteps: [],
  skippedSteps: [],
};

describe("getUserInsights", () => {
  it("flags critical urgency when user is not registered", () => {
    const result = getUserInsights({ ...baseUser, age: 21, isRegistered: false, hasEpic: false });
    expect(result.urgency).toBe("critical");
    expect(result.nextStepId).toBe("registration");
    expect(result.risks.some((risk) => risk.severity === "critical")).toBe(true);
  });

  it("returns high confidence for ready-to-vote users", () => {
    const result = getUserInsights({
      ...baseUser,
      age: 25,
      isRegistered: true,
      hasEpic: true,
      completedSteps: ["4", "5", "6"],
    });
    expect(result.confidenceScore).toBeGreaterThanOrEqual(95);
    expect(result.urgency).toBe("info");
  });

  it("flags underage users and keeps eligibility as the next step", () => {
    const result = getUserInsights({ ...baseUser, age: 17, isRegistered: false, hasEpic: false });
    expect(result.nextStepId).toBe("eligibility");
    expect(result.risks.some((risk) => risk.message.includes("must be 18+"))).toBe(true);
  });

  it("adds a skipped-step reminder and a fully prepared suggestion when applicable", () => {
    const result = getUserInsights({
      ...baseUser,
      age: 30,
      isRegistered: true,
      hasEpic: true,
      skippedSteps: ["booth"],
      completedSteps: ["4", "5", "6"],
    });
    expect(result.risks.some((risk) => risk.message.includes("previously skipped"))).toBe(true);
    expect(result.suggestions.some((suggestion) => suggestion.includes("fully prepared"))).toBe(
      true,
    );
  });
});
