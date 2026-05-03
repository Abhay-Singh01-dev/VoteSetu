import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import { createHttpApp } from "../server/httpApp";

describe("createHttpApp", () => {
  const savedGeminiKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    if (savedGeminiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = savedGeminiKey;
    }
  });

  it("GET /healthz returns service metadata", async () => {
    const app = createHttpApp();
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, service: "votesetu" });
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["cross-origin-opener-policy"]).toBe("same-origin");
  });

  it("POST /api/chat returns 400 when message missing", async () => {
    const app = createHttpApp();
    const res = await request(app)
      .post("/api/chat")
      .send({})
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
  });

  it("POST /api/chat rejects unrelated queries", async () => {
    const app = createHttpApp();
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Write me a cake recipe" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("only answers election");
  });

  it("POST /api/chat streams simulated reply when GEMINI_API_KEY is unset", async () => {
    delete process.env.GEMINI_API_KEY;
    const app = createHttpApp();
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "What is VVPAT in Indian elections?" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    expect(res.text).toContain("VVPAT");
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("GET /api/google/status returns Google integration metadata without secrets", async () => {
    delete process.env.GEMINI_API_KEY;
    const app = createHttpApp();
    const res = await request(app).get("/api/google/status");
    expect(res.status).toBe(200);
    expect(res.body.provider).toBe("google-gemini");
    expect(res.body.restConfigured).toBe(false);
    expect(res.body.chatModel).toMatch(/^gemini-/);
  });
});
