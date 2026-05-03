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
  });

  it("POST /api/chat returns 400 when message missing", async () => {
    const app = createHttpApp();
    const res = await request(app)
      .post("/api/chat")
      .send({})
      .set("Content-Type", "application/json");
    expect(res.status).toBe(400);
  });

  it("POST /api/chat streams simulated reply when GEMINI_API_KEY is unset", async () => {
    delete process.env.GEMINI_API_KEY;
    const app = createHttpApp();
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "What is VVPAT in Indian elections?" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    expect(res.text).toContain("simulated backend");
  });
});
