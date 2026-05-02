import { describe, expect, it } from "vitest";
import { validateEpic } from "@/data/electionData";
import { isElectionQuery } from "@/lib/voiceProcessor";

describe("domain guard: isElectionQuery", () => {
  it("accepts election-related questions", () => {
    expect(isElectionQuery("How do I find my polling booth?")).toBe(true);
    expect(isElectionQuery("What is VVPAT in election voting?")).toBe(true);
  });

  it("rejects unrelated prompts", () => {
    expect(isElectionQuery("Write me a JavaScript sorting algorithm")).toBe(false);
    expect(isElectionQuery("Suggest a gym workout plan")).toBe(false);
  });
});

describe("EPIC validation", () => {
  it("marks canonical 3+7 format as valid", () => {
    const result = validateEpic("ABC1234567");
    expect(result.status).toBe("valid");
  });

  it("marks malformed values as invalid", () => {
    const result = validateEpic("AB@12");
    expect(result.status).toBe("invalid");
  });

  it("returns empty state when no input is provided", () => {
    const result = validateEpic("");
    expect(result.status).toBe("empty");
  });
});
