import { describe, expect, it } from "vitest";
import { getUserInsights } from "@/lib/userInsights";
import type { UserState } from "@/context/UserContext";

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
});
