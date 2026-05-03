import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContentStream: async () => ({
          stream: (async function* () {
            yield { text: () => "Gemini test chunk" };
          })(),
        }),
      };
    }
  },
}));

import { createHttpApp } from "../server/httpApp";

describe("createHttpApp / Gemini path", () => {
  const saved = process.env.GEMINI_API_KEY;

  afterEach(() => {
    if (saved === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = saved;
  });

  it("streams assistant output when GEMINI_API_KEY is present", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const app = createHttpApp();
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "What is an EVM?" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Gemini test chunk");
  });
});
