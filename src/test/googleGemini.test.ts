import { describe, it, expect } from "vitest";
import {
  buildElectionAssistantPrompt,
  getGenerativeLanguageBidiUrl,
  getGoogleServiceStatus,
  GOOGLE_GENERATIVE_AI,
  GOOGLE_GENERATIVE_LANGUAGE_BIDI_PATH,
} from "../lib/googleGemini";

describe("googleGemini", () => {
  it("uses a stable chat model id for Google Generative AI", () => {
    expect(GOOGLE_GENERATIVE_AI.CHAT_MODEL).toMatch(/^gemini-/);
  });

  it("builds a wss URL with encoded key and correct Bidi path", () => {
    const key = "key&with=special";
    const url = getGenerativeLanguageBidiUrl(key);
    expect(url).toContain("wss://generativelanguage.googleapis.com");
    expect(url).toContain(GOOGLE_GENERATIVE_LANGUAGE_BIDI_PATH);
    expect(url).toContain(encodeURIComponent(key));
  });

  it("builds an election-scoped prompt for Gemini", () => {
    const prompt = buildElectionAssistantPrompt("How do I register to vote?");
    expect(prompt).toContain("VoteSetu");
    expect(prompt).toContain("Only answer questions related to elections");
    expect(prompt).toContain("How do I register to vote?");
  });

  it("returns reviewer-friendly Google service status metadata", () => {
    const status = getGoogleServiceStatus(true);
    expect(status.provider).toBe("google-gemini");
    expect(status.restConfigured).toBe(true);
    expect(status.liveConfigured).toBe(true);
    expect(status.deploymentTargets).toContain("Cloud Run");
  });
});
