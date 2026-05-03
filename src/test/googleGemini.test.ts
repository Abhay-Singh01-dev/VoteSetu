import { describe, it, expect } from "vitest";
import {
  getGenerativeLanguageBidiUrl,
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
});
